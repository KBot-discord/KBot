import { CustomEmotes, EmbedColors } from '#utils/constants';
import { isNullOrUndefined } from '#utils/functions';
import { fetchChannel } from '#utils/discord';
import { container } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { PollRepository } from '@kbotdev/database';
import type { CreatePollData, Poll, UpsertPollUserData } from '@kbotdev/database';
import type { GuildTextBasedChannel, Message } from 'discord.js';
import type { PollResultPayload } from '#types/Tasks';
import type { Key } from '@kbotdev/redis';

const BAR_LENGTH = 10;

export class PollService {
	private readonly repository: PollRepository;

	public constructor() {
		const { prisma, redis, config } = container;

		this.repository = new PollRepository({
			database: prisma,
			cache: {
				client: redis,
				defaultExpiry: config.db.cacheExpiry
			}
		});
	}

	/**
	 * Gets a poll.
	 * @param pollId - The ID of the poll.
	 */
	public async get(pollId: string): Promise<Poll | null> {
		return this.repository.get({ pollId });
	}

	/**
	 * Get the polls of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async getByGuild(guildId: string): Promise<Poll[]> {
		return this.repository.getByGuild({ guildId });
	}

	/**
	 * Create a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 * @param data - The data to create the poll
	 */
	public async create(guildId: string, pollId: string, data: CreatePollData): Promise<Poll> {
		return this.repository.create({ guildId, pollId }, data);
	}

	/**
	 * Delete a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async delete(guildId: string, pollId: string): Promise<Poll | null> {
		return this.repository.delete({ guildId, pollId });
	}

	/**
	 * Get the count of polls for a guild.
	 * @param guildId - The ID of the guild
	 */
	public async count(guildId: string): Promise<number> {
		return this.repository.count({ guildId });
	}

	/**
	 * Check if a poll is active.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async isActive(guildId: string, pollId: string): Promise<boolean> {
		return this.repository.isActive({ guildId, pollId });
	}

	/**
	 * Add a vote, or update an existing one.
	 * @param data - The data to upsert the vote
	 */
	public async upsertVote(data: UpsertPollUserData): Promise<void> {
		return this.repository.upsertVote(data);
	}

	/**
	 * Get the votes of a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async getVotes(guildId: string, pollId: string): Promise<Map<string, number>> {
		return this.repository.getVotes({ guildId, pollId });
	}

	/**
	 * Create a task for the ending of a poll.
	 * @param expiresIn - How long until the task should expire
	 * @param data - The data to create the task
	 */
	public async createTask(expiresIn: number, data: PollResultPayload): Promise<void> {
		const { guildId, pollId } = data;

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

	/**
	 * Delete a poll task.
	 * @param pollId - The ID of the poll
	 */
	public async deleteTask(pollId: string): Promise<void> {
		await container.tasks.delete(this.pollJobId(pollId));
	}

	/**
	 * End a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async end(guildId: string, pollId: string): Promise<boolean> {
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

			channel = await fetchChannel<GuildTextBasedChannel>(poll.channelId);
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

	/**
	 * Calculate the results of a poll from the votes.
	 * @param poll - The poll to calculate results for
	 * @param votes - A {@link Map} of the votes
	 */
	public calculateResults(poll: Poll, votes: Map<string, number>): string[] {
		const { options } = poll;
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
