import { CustomEmotes, EmbedColors } from '#utils/constants';
import { isNullOrUndefined } from '#utils/functions';
import { container } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { PollRepository } from '@kbotdev/database';
import type { CreatePollData, GuildAndPollId, Poll, UpsertPollUserData } from '@kbotdev/database';
import type { GuildTextBasedChannel, Message } from 'discord.js';
import type { PollResultPayload } from '#types/Tasks';
import type { Key } from '@kbotdev/redis';

const BAR_LENGTH = 10;

export class PollService {
	private readonly repository: PollRepository;

	public constructor() {
		this.repository = new PollRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	public async get(pollId: string): Promise<Poll | null> {
		return this.repository.get({ pollId });
	}

	public async getByGuild(guildId: string): Promise<Poll[]> {
		return this.repository.getByGuild({ guildId });
	}

	public async create(guildId: string, pollId: string, data: CreatePollData): Promise<Poll> {
		return this.repository.create({ guildId, pollId }, data);
	}

	public async delete(guildId: string, pollId: string): Promise<Poll | null> {
		return this.repository.delete({ guildId, pollId });
	}

	public async count(guildId: string): Promise<number> {
		return this.repository.count({ guildId });
	}

	public async isActive(guildId: string, pollId: string): Promise<boolean> {
		return this.repository.isActive({ guildId, pollId });
	}

	public async upsertVote(data: UpsertPollUserData): Promise<void> {
		return this.repository.upsertVote(data);
	}

	public async getVotes(guildId: string, pollId: string): Promise<Map<string, number>> {
		return this.repository.getVotes({ guildId, pollId });
	}

	public async createTask(expiresIn: number, { guildId, pollId }: PollResultPayload): Promise<void> {
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

	public async deleteTask(pollId: string): Promise<void> {
		await container.tasks.delete(this.pollJobId(pollId));
	}

	public async end({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		const { client, validator, logger } = container;

		const guild = client.guilds.cache.get(guildId);
		const bot = await guild!.members.fetchMe();
		let poll: Poll | null;
		let channel: GuildTextBasedChannel | null;
		let message: Message | null;

		try {
			poll = await this.get(pollId);
			if (isNullOrUndefined(poll)) {
				logger.sentryMessage('Failed to find a poll while attempting to end it', {
					context: { pollId }
				});
				return false;
			}

			channel = (await client.channels.fetch(poll.channelId)) as GuildTextBasedChannel | null;
			const { result } = await validator.channels.canSendEmbeds(channel);
			if (!result || !channel || !channel.isTextBased() || channel.isDMBased()) return false;

			message = await channel.messages.fetch(pollId).catch(() => null);
		} catch (error: unknown) {
			logger.sentryError(error);
			await this.delete(guildId, pollId);
			return false;
		}

		try {
			await this.repository.removeActive({ guildId, pollId });

			let shouldSend = false;
			const votes = await this.getVotes(guildId, pollId);
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

			await this.delete(guildId, pollId);

			return true;
		} catch (error: unknown) {
			logger.sentryError(error);
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
					? CustomEmotes.Blank.repeat(BAR_LENGTH)
					: CustomEmotes.BlueSquare.repeat(amount) + CustomEmotes.Blank.repeat(BAR_LENGTH - amount);

			return `**${option.name}**\n${bar} ${percent}% (${option.value} ${option.value === 1 ? 'vote' : 'votes'})`;
		});
	}

	private readonly pollJobId = (pollId: string): Key => `poll:${pollId}` as Key;
}
