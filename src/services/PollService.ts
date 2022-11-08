// Imports
import { container, Result } from '@sapphire/framework';
import { type Message, MessageEmbed } from 'discord.js';
import type { Poll, PollUser } from '@prisma/client';
import { isNullish } from '@sapphire/utilities';

export class PollService {
	public constructor() {
		container.logger.info('Poll service loaded.');
	}

	/**
	 * Create a new poll in the database
	 * @param message The message associated with the poll
	 * @param options The options of the poll
	 * @param expiresAt When the poll expires
	 * @returns Returns the new poll
	 */
	public async createPoll(message: Message, options: string[], expiresAt: number): Promise<Poll | null> {
		const result = await Result.fromAsync(async () =>
			container.db.poll.create({
				data: {
					id: message.id,
					channel: message.channelId,
					time: expiresAt,
					options,
					utility: { connect: { id: message.guildId! } }
				}
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Get a poll from the database
	 * @param messageId The message ID of the poll
	 * @returns The requested poll
	 */
	public async getPoll(messageId: string): Promise<Poll | null> {
		const result = await Result.fromAsync(async () => container.db.poll.findUnique({ where: { id: messageId } }));
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Get a poll and it's users from the database
	 * @param messageId The message ID of the poll
	 * @returns The requested poll with its users
	 */
	public async getPollWithUsers(messageId: string): Promise<(Poll & { users: PollUser[] }) | null> {
		const result = await Result.fromAsync(async () =>
			container.db.poll.findUnique({
				where: { id: messageId },
				include: { users: true }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Delete a poll from the database
	 * @param messageId The message ID of the poll
	 * @returns The deleted poll
	 */
	public async deletePoll(messageId: string): Promise<Poll | null> {
		const result = await Result.fromAsync(async () => container.db.poll.delete({ where: { id: messageId } }));
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Update a user on the requested poll
	 * @param userId The ID of the user
	 * @param messageId The message ID of the poll
	 * @param option The option that the user chose
	 * @returns The updated user
	 */
	public async updatePollUser(userId: string, messageId: string, option: number): Promise<PollUser | null> {
		const result = await Result.fromAsync(async () =>
			container.db.pollUser.upsert({
				where: { id: userId, pollId: messageId },
				update: { option },
				create: { id: userId, option, pollId: messageId }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Create a poll task
	 * @param message The message associated with the poll
	 * @param expiresIn The amount of time until the poll expires
	 * @returns idk lol
	 */
	public createPollTask(message: Message, expiresIn: number) {
		return container.tasks.create(
			'pollResults',
			{
				channelId: message.channelId,
				messageId: message.id
			},
			expiresIn
		);
	}

	/**
	 * Delete a poll task
	 * @param messageId The message ID of the poll
	 * @returns idk lol
	 */
	public deletePollTask(messageId: string) {
		return container.tasks.delete(messageId);
	}

	/**
	 * End a poll and show the results
	 * @param channelId The ID of the channel that the poll is in
	 * @param messageId The message ID of the poll
	 */
	public async endPoll(channelId: string, messageId: string): Promise<void> {
		try {
			const message = await container.client.channels
				.fetch(channelId)
				.then((channel) => (channel?.isText() ? channel.messages.fetch(messageId) : null));
			if (!message) {
				await this.deletePoll(messageId);
				return;
			}

			const results = await this.calculateResults(message);
			if (isNullish(results)) return;

			const embed = message.embeds[0];
			await message.edit({
				embeds: [embed, new MessageEmbed().setColor('RED').setTitle('Poll has ended')],
				components: []
			});

			await message.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#006BFC')
						.setTitle(`Results: ${embed.title}`)
						.setDescription(results.join('\n'))
						.setFooter({ text: embed.footer!.text })
						.setTimestamp()
				]
			});
		} catch (error: any) {
			container.logger.error(error);
		} finally {
			await this.deletePoll(messageId);
		}
	}

	/**
	 * Get the poll from the database and calculate its results
	 * @param message The message associated with the poll
	 * @returns The poll's results
	 */
	private async calculateResults(message: Message): Promise<string[] | null> {
		const poll = await this.getPollWithUsers(message.id);
		if (isNullish(poll) || poll.users.length === 0) {
			await this.deletePoll(message.id);
			return null;
		}

		const { options, users } = poll;
		const formattedOptions = options.map((option) => ({ name: option, value: 0 }));
		for (const user of users) {
			formattedOptions[user.option].value += 1;
		}

		return formattedOptions.map((option) => {
			const v = Math.fround(option.value / users.length);
			const amount = Math.round(v * 20);

			let percent: string = Math.fround(v * 100).toFixed(2);
			let bar = '▓'.repeat(amount) + '░'.repeat(20 - amount);
			if (users.length === 0) {
				percent = '0';
				bar = '░'.repeat(20);
			}
			return `**${option.name}**\n${bar} ${percent}% (${option.value} ${option.value === 1 ? 'vote' : 'votes'})`;
		});
	}
}
