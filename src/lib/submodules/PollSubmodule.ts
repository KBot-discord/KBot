import { PollRepository } from '#repositories';
import { EmbedColors } from '#utils/constants';
import { container } from '@sapphire/framework';
import { ChannelType, EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { PollResultPayload } from '#types/Tasks';
import type { CreatePollData, PollWithUsers, UpdatePollUserData } from '#types/repositories';

export class PollSubmodule {
	private readonly repository: PollRepository;

	public constructor() {
		this.repository = new PollRepository();
	}

	public async fetch(pollId: string) {
		return this.repository.findOne({ pollId });
	}

	public async fetchByGuildId(guildId: string) {
		return this.repository.findMany({ guildId });
	}

	public async create(guildId: string, pollId: string, data: CreatePollData) {
		return this.repository.create({ guildId, pollId }, data);
	}

	public async updateUser(data: UpdatePollUserData) {
		return this.repository.upsertUser(data);
	}

	public async count(guildId: string) {
		return this.repository.count({ guildId });
	}

	public createTask(expiresIn: number, { pollId }: PollResultPayload) {
		container.tasks.create(
			'pollResults',
			{ pollId },
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

	public async end(pollId: string): Promise<boolean> {
		try {
			const poll = await this.repository.findOne({ pollId });
			if (isNullish(poll)) return false;

			const message = await container.client.channels
				.fetch(poll.channelId)
				.then((channel) => (channel?.type === ChannelType.GuildText ? channel.messages.fetch(pollId) : null));
			if (!message) {
				await this.repository.delete({ pollId });
				return false;
			}

			const results = this.calculateResults(poll);
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
			await this.repository.delete({ pollId });
			return true;
		} catch (error: any) {
			container.logger.error(error);
			return false;
		}
	}

	public calculateResults({ options, users }: PollWithUsers): string[] {
		const formattedOptions = options.map((option) => ({ name: option, value: 0 }));

		for (const user of users) {
			formattedOptions[user.option].value++;
		}

		return formattedOptions.map((option) => {
			const scaledValue = Math.fround(option.value / users.length);
			const amount = Math.round(scaledValue * 20);

			const percent: string = users.length === 0 ? '0' : Math.fround(scaledValue * 100).toFixed(2);
			const bar = users.length === 0 ? '░'.repeat(20) : '▓'.repeat(amount) + '░'.repeat(20 - amount);

			return `**${option.name}**\n${bar} ${percent}% (${option.value} ${option.value === 1 ? 'vote' : 'votes'})`;
		});
	}

	private readonly pollJobId = (pollId: string) => `poll:${pollId}`;
}
