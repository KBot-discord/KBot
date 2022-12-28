import { PollRepository } from '#lib/database/repositories/PollRepository';
import { EmbedColors } from '#utils/constants';
import { container } from '@sapphire/framework';
import { type Message, MessageEmbed } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { Poll, PollUser } from '@prisma/client';

export class PollService {
	public readonly repo;

	public constructor() {
		this.repo = new PollRepository();
		container.logger.info('Poll service loaded.');
	}

	/**
	 * Create a poll task
	 * @param message The message associated with the poll
	 * @param expiresIn The amount of time until the poll expires
	 * @returns idk lol
	 */
	public createPollTask(message: Message, expiresIn: number) {
		container.tasks.create(
			'pollResults',
			{
				channelId: message.channelId,
				messageId: message.id
			},
			{
				customJobOptions: {
					jobId: `poll:${message.id}`
				},
				repeated: false,
				delay: expiresIn
			}
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
	 * @param messageId The message ID of the poll
	 */
	public async endPoll(messageId: string): Promise<boolean> {
		try {
			const poll = await this.repo.getPollWithUsers(messageId);
			if (isNullish(poll)) return false;

			const message = await container.client.channels
				.fetch(poll.channel)
				.then((channel) => (channel?.isText() ? channel.messages.fetch(messageId) : null));
			if (!message) {
				await this.repo.deletePoll(messageId);
				return false;
			}

			const results = this.calculateResults(poll);
			const embed = message.embeds[0];
			await message.edit({
				embeds: [embed, new MessageEmbed().setColor('RED').setTitle('Poll has ended')],
				components: []
			});
			await message.reply({
				embeds: [
					new MessageEmbed()
						.setColor(EmbedColors.Default)
						.setTitle(`Results: ${embed.title}`)
						.setDescription(results.join('\n'))
						.setFooter({ text: embed.footer!.text })
						.setTimestamp()
				]
			});
			await this.repo.deletePoll(messageId);
			return true;
		} catch (error: any) {
			container.logger.error(error);
			return false;
		}
	}

	/**
	 * Get the poll from the database and calculate its results
	 * @param poll The poll and it's users
	 * @returns The poll's results
	 */
	public calculateResults(poll: Poll & { users: PollUser[] }): string[] {
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
