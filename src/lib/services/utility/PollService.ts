import { EmbedColors } from '#utils/constants';
import { pollCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildAndPollId, GuildId, PollId, CreatePollData, UpsertPollUserData } from '#types/database';
import type { RedisClient } from '#extensions/RedisClient';
import type { PrismaClient, Poll } from '#prisma';
import type { PollResultPayload } from '#types/Tasks';
import type { Key } from '#types/Generic';

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

	public async create({ guildId, pollId }: GuildAndPollId, { title, channelId, time, options }: CreatePollData): Promise<Poll> {
		await this.addActive({ guildId, pollId });
		return this.database.poll.create({
			data: {
				id: pollId,
				title,
				channelId,
				time,
				options,
				utilitySettings: { connect: { guildId } }
			}
		});
	}

	public async delete({ pollId }: PollId): Promise<Poll | null> {
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

	public createTask(expiresIn: number, { guildId, pollId }: PollResultPayload) {
		container.tasks.create(
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
		const { client, validator } = container;
		try {
			const poll = await this.get({ pollId });
			if (isNullish(poll)) return false;

			const channel = await client.channels.fetch(poll.channelId);
			const { result } = await validator.channels.canSendEmbeds(channel);
			if (!result || !channel || !channel.isTextBased() || channel.isDMBased()) return false;

			const message = await channel.messages.fetch(pollId);
			if (!message) return false;

			await this.removeActive({ guildId, pollId });

			const votes = await this.getVotes({ guildId, pollId });
			const results = this.calculateResults(poll, votes);
			const embed = message.embeds[0];

			await message.edit({
				embeds: [embed, new EmbedBuilder().setColor(EmbedColors.Error).setTitle('Poll has ended')],
				components: []
			});
			await message.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Default)
						.setTitle(`Results: ${embed.title}`)
						.setDescription(results.join('\n'))
						.setFooter({ text: embed.footer!.text })
						.setTimestamp()
				]
			});
			return true;
		} catch (error: any) {
			container.logger.error(error);
			return false;
		}
	}

	public calculateResults({ options }: Poll, votes: Map<string, number>): string[] {
		const formattedOptions = options.map((option) => ({ name: option, value: 0 }));

		for (const option of Object.values(votes)) {
			formattedOptions[option].value++;
		}

		return formattedOptions.map((option) => {
			const scaledValue = Math.fround(option.value / votes.size);
			const amount = Math.round(scaledValue * 20);

			const percent: string = votes.size === 0 ? '0' : Math.fround(scaledValue * 100).toFixed(2);
			const bar = votes.size === 0 ? '░'.repeat(20) : '▓'.repeat(amount) + '░'.repeat(20 - amount);

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
