import { CustomEmotes, EmbedColors } from '#utils/constants';
import { pollCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildTextBasedChannel, Message } from 'discord.js';
import type { GuildAndPollId, GuildId, PollId, CreatePollData, UpsertPollUserData } from '#types/database';
import type { RedisClient } from '#extensions/RedisClient';
import type { PrismaClient, Poll } from '@kbotdev/database';
import type { PollResultPayload } from '#types/Tasks';
import type { Key } from '#types/Generic';

const BAR_LENGTH = 10;

export class PollService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async get({ pollId }: PollId): Promise<Poll | null> {
		return this.database.poll.findUnique({
			where: { id: pollId }
		});
	}

	public async getByGuild({ guildId }: GuildId): Promise<Poll[]> {
		return this.database.poll.findMany({
			where: { guildId }
		});
	}

	public async create({ guildId, pollId }: GuildAndPollId, { title, channelId, time, options, creator }: CreatePollData): Promise<Poll> {
		await this.addActive({ guildId, pollId });
		return this.database.poll.create({
			data: {
				id: pollId,
				title,
				channelId,
				time,
				options,
				creator,
				utilitySettings: { connect: { guildId } }
			}
		});
	}

	public async delete({ guildId, pollId }: GuildAndPollId): Promise<Poll | null> {
		const pollKey = this.pollKey(guildId, pollId);
		await this.cache.del(pollKey);
		return this.database.poll
			.delete({
				where: { id: pollId }
			})
			.catch(() => null);
	}

	public async count({ guildId }: GuildId): Promise<number> {
		return this.database.poll.count({
			where: { guildId }
		});
	}

	public async isActive({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		return this.cache.sIsMember(this.setKey(guildId), this.memberKey(pollId));
	}

	public async upsertVote({ guildId, pollId, userId, option }: UpsertPollUserData): Promise<void> {
		const pollKey = this.pollKey(guildId, pollId);
		const userKey = this.pollUserKey(userId);
		await this.cache.hSet<number>(pollKey, userKey, option);
	}

	public async getVotes({ guildId, pollId }: GuildAndPollId) {
		const pollKey = this.pollKey(guildId, pollId);
		return this.cache.hGetAll<number>(pollKey);
	}

	public async createTask(expiresIn: number, { guildId, pollId }: PollResultPayload) {
		await container.tasks.create(
			'pollResults',
			{ guildId, pollId },
			{
				customJobOptions: {
					jobId: this.pollJobId(pollId)
				},
				repeated: false,
				delay: expiresIn
			}
		);
	}

	public deleteTask(pollId: string) {
		return container.tasks.delete(this.pollJobId(pollId));
	}

	public async end({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		const { client, validator, logger } = container;

		const guild = client.guilds.cache.get(guildId);
		const bot = await guild!.members.fetchMe();
		let poll: Poll | null;
		let channel: GuildTextBasedChannel | null;
		let message: Message | null;

		try {
			poll = await this.get({ pollId });
			if (isNullish(poll)) return false;

			channel = (await client.channels.fetch(poll.channelId)) as GuildTextBasedChannel | null;
			const { result } = await validator.channels.canSendEmbeds(channel);
			if (!result || !channel || !channel.isTextBased() || channel.isDMBased()) return false;

			message = await channel.messages.fetch(pollId).catch(() => null);
		} catch (err: unknown) {
			logger.error(err);
			await this.delete({ guildId, pollId });
			return false;
		}

		try {
			await this.removeActive({ guildId, pollId });

			let shouldSend = false;
			const votes = await this.getVotes({ guildId, pollId });
			const results = this.calculateResults(poll, votes);

			if (message && channel.permissionsFor(bot).has(PermissionFlagsBits.ReadMessageHistory)) {
				const result = await message
					.edit({
						embeds: [message.embeds[0], new EmbedBuilder().setColor(EmbedColors.Error).setTitle('Poll has ended')],
						components: []
					})
					.catch(() => null);

				if (result) {
					await result.reply({
						embeds: [
							new EmbedBuilder()
								.setColor(EmbedColors.Default)
								.setTitle(`Results: ${poll.title}`)
								.setDescription(results.join('\n'))
								.setFooter({ text: `Poll made by ${poll.creator}` })
								.setTimestamp()
						]
					});
				} else {
					shouldSend = true;
				}
			}

			if (shouldSend) {
				await channel.send({
					embeds: [
						new EmbedBuilder()
							.setColor(EmbedColors.Default)
							.setTitle(`Results: ${poll.title}`)
							.setDescription(results.join('\n'))
							.setFooter({ text: `Poll made by ${poll.creator}` })
							.setTimestamp()
					]
				});
			}

			await this.delete({ guildId, pollId });

			return true;
		} catch (error: any) {
			container.logger.error(error);
			return false;
		}
	}

	public calculateResults({ options }: Poll, votes: Map<string, number>): string[] {
		const formattedOptions = options.map((option) => ({ name: option, value: 0 }));

		for (const option of [...votes.values()]) {
			formattedOptions[option].value++;
		}

		return formattedOptions.map((option) => {
			const scaledValue = Math.fround(option.value / votes.size);
			const amount = Math.round(scaledValue * BAR_LENGTH);

			const percent: string = votes.size === 0 ? '0' : Math.fround(scaledValue * 100).toFixed(2);
			const bar =
				votes.size === 0 //
					? `${CustomEmotes.Blank}`.repeat(BAR_LENGTH)
					: `${CustomEmotes.BlueSquare}`.repeat(amount) + `${CustomEmotes.Blank}`.repeat(BAR_LENGTH - amount);

			return `**${option.name}**\n${bar} ${percent}% (${option.value} ${option.value === 1 ? 'vote' : 'votes'})`;
		});
	}

	private async addActive({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		return this.cache.sAdd(this.setKey(guildId), this.memberKey(pollId));
	}

	private async removeActive({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		return this.cache.sRem(this.setKey(guildId), this.memberKey(pollId));
	}

	private readonly pollKey = (guildId: string, pollId: string) => `${pollCacheKey(guildId)}:${pollId}` as Key;
	private readonly pollUserKey = (userId: string) => `user:${userId}` as Key;
	private readonly setKey = (guildId: string) => `${pollCacheKey(guildId)}:active` as Key;
	private readonly memberKey = (pollId: string) => `polls:${pollId}:active` as Key;
	private readonly pollJobId = (pollId: string) => `poll:${pollId}`;
}
