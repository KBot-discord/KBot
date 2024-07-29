import type { Poll } from '@prisma/client';
import { container } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import type { GuildTextBasedChannel, Message } from 'discord.js';
import type { PollResultPayload } from '../types/Tasks.js';
import { CustomEmotes, EmbedColors } from '../utilities/constants.js';
import { fetchChannel } from '../utilities/discord.js';
import { pollCacheKey } from './keys.js';

const BAR_LENGTH = 10;

export class PollService {
	/**
	 * Gets a poll.
	 * @param pollId - The ID of the poll.
	 */
	public async get(pollId: string): Promise<Poll | null> {
		return await container.prisma.poll.findUnique({
			where: { id: pollId },
		});
	}

	/**
	 * Get the polls of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async getByGuild(guildId: string): Promise<Poll[]> {
		return await container.prisma.poll.findMany({
			where: { guildId },
		});
	}

	/**
	 * Create a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 * @param data - The data to create the poll
	 */
	public async create(
		guildId: string,
		pollId: string,
		data: {
			title: string;
			channelId: string;
			time?: bigint | null;
			options: string[];
			creator: string;
		},
	): Promise<Poll> {
		const { title, channelId, time, options, creator } = data;

		await this.addActive(guildId, pollId);
		return await container.prisma.poll.create({
			data: {
				id: pollId,
				title,
				channelId,
				time,
				options,
				creator,
				utilitySettings: { connect: { guildId } },
			},
		});
	}

	/**
	 * Delete a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async delete(guildId: string, pollId: string): Promise<Poll | null> {
		const pollKey = this.pollKey(guildId, pollId);

		await container.redis.delete(pollKey);
		return await container.prisma.poll
			.delete({
				where: { id: pollId },
			})
			.catch(() => null);
	}

	/**
	 * Get the count of polls for a guild.
	 * @param guildId - The ID of the guild
	 */
	public async count(guildId: string): Promise<number> {
		return await container.prisma.poll.count({
			where: { guildId },
		});
	}

	/**
	 * Check if a poll is active.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async isActive(guildId: string, pollId: string): Promise<boolean> {
		return await container.redis.sIsMember(this.setKey(guildId), this.memberKey(pollId));
	}

	/**
	 * Add a vote, or update an existing one.
	 * @param data - The data to upsert the vote
	 */
	public async upsertVote(data: {
		guildId: string; //
		pollId: string;
		userId: string;
		option: string;
	}): Promise<void> {
		const { guildId, pollId, userId, option } = data;

		const pollKey = this.pollKey(guildId, pollId);
		const userKey = this.pollUserKey(userId);

		await container.redis.hSet<string>(pollKey, userKey, option);
	}

	/**
	 * Get the votes of a poll.
	 * @param guildId - The ID of the guild
	 * @param pollId - The ID of the poll
	 */
	public async getVotes(guildId: string, pollId: string): Promise<Map<string, string>> {
		const pollKey = this.pollKey(guildId, pollId);

		return await container.redis.hGetAll<string>(pollKey);
	}

	/**
	 * Set a poll as active.
	 * @param data - The {@link GuildAndPollId} to set the poll as active
	 */
	public async addActive(guildId: string, pollId: string): Promise<boolean> {
		return await container.redis.sAdd(this.setKey(guildId), this.memberKey(pollId));
	}

	/**
	 * Set a poll as inactive.
	 * @param data - The {@link GuildAndPollId} to set the poll as inactive
	 */
	public async removeActive(guildId: string, pollId: string): Promise<boolean> {
		return await container.redis.sRem(this.setKey(guildId), this.memberKey(pollId));
	}

	/**
	 * Create a task for the ending of a poll.
	 * @param expiresIn - How long until the task should expire
	 * @param data - The data to create the task
	 */
	public async createTask(expiresIn: number, data: PollResultPayload): Promise<void> {
		const { guildId, pollId } = data;

		await container.tasks.create(
			{ name: 'pollResults', payload: { guildId, pollId } },
			{
				customJobOptions: {
					jobId: this.pollJobId(pollId),
				},
				repeated: false,
				delay: expiresIn,
			},
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
					context: { pollId },
				});
				return false;
			}

			channel = await fetchChannel<GuildTextBasedChannel>(poll.channelId);
			if (!channel?.isTextBased() || channel.isDMBased()) return false;

			const { result } = await validator.channels.canSendEmbeds(channel);
			if (!result) return false;

			message = await channel.messages.fetch(pollId).catch(() => null);
		} catch (error: unknown) {
			logger.sentryError(error);
			await this.delete(guildId, pollId);
			return false;
		}

		try {
			await this.removeActive(guildId, pollId);

			let shouldSend = false;
			const votes = await this.getVotes(guildId, pollId);
			const results = this.calculateResults(poll, votes);

			if (message && channel.permissionsFor(bot).has(PermissionFlagsBits.ReadMessageHistory)) {
				const result = await message
					.edit({
						embeds: [message.embeds[0], new EmbedBuilder().setColor(EmbedColors.Error).setTitle('Poll has ended')],
						components: [],
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
								.setTimestamp(),
						],
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
							.setTimestamp(),
					],
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
	public calculateResults(poll: Poll, votes: Map<string, string>): string[] {
		const { options } = poll;
		const formattedOptions = options.map((option) => ({ name: option, value: 0 }));

		for (const option of votes.values()) {
			const coerce = Number(option);
			if (Number.isNaN(coerce)) throw new TypeError('Expected number, received NaN');

			formattedOptions[Number(option)].value++;
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

	private readonly pollJobId = (pollId: string): string => `poll:${pollId}`;
	private readonly pollKey = (guildId: string, pollId: string): string => `${pollCacheKey(guildId)}:${pollId}`;
	private readonly pollUserKey = (userId: string): string => `user:${userId}`;
	private readonly setKey = (guildId: string): string => `${pollCacheKey(guildId)}:active`;
	private readonly memberKey = (pollId: string): string => `polls:${pollId}:active`;
}
