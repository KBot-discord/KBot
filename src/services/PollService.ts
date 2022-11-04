// Imports
import { container } from '@sapphire/framework';
import { ButtonInteraction, Message, MessageEmbed } from 'discord.js';
import { BaseService } from './BaseService';
import { KeyEnum } from '../lib/types/keys';


export class PollService extends BaseService {
    public readonly NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    public readonly TIME_LIMIT = 604800000; // 7 days

    public constructor() {
        super(KeyEnum.Polls);
    }

    public createPoll(message: Message, expiresAt: number) {
        return container.db.poll.create({
            data: {
                id: message.id,
                channel: message.channelId,
                time: expiresAt,
                utility: { connect: { id: message.guildId! } },
            },
        });
    }

    public getPoll(messageId: string) {
        return container.db.poll.findUnique({ where: { id: messageId } });
    }

    public deletePoll(messageId: string) {
        return container.db.poll.delete({ where: { id: messageId } });
    }

    public updatePollUser(interaction: ButtonInteraction, option: number) {
        return container.db.pollUser.upsert({
            where: { id: interaction.user.id, pollId: interaction.message.id },
            update: { option },
            create: { id: interaction.user.id, option, pollId: interaction.message.id },
        });
    }

    public createPollTask(message: Message, expiresIn: number) {
        return container.tasks.create('pollResults', {
            channelId: message.channelId,
            messageId: message.id,
        }, expiresIn);
    }

    public deletePollTask(messageId: string) {
        return container.tasks.delete(messageId);
    }

    public async endPoll(channelId: string, messageId: string): Promise<void> {
        try {
            const message = await container.client.channels.fetch(channelId)
                .then((channel) => (channel?.isText() ? channel.messages.fetch(messageId) : null));
            if (!message) {
                await this.deletePoll(messageId);
                return;
            }

            const results = this.calculateResults(message);
            const embed = message.embeds[0];

            await message.edit({
                embeds: [
                    embed,
                    new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Poll has ended'),
                ],
                components: [],
            });

            await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#006BFC')
                        .setTitle(`Results: ${embed.title}`)
                        .setDescription(results.join('\n'))
                        .setFooter({ text: embed.footer!.text })
                        .setTimestamp(),
                ],
            });
        } catch (error: any) {
            container.logger.error(error);
        } finally {
            await this.deletePoll(messageId);
        }
    }

    private calculateResults(message: Message) {
        const results = []; let sum = 0;
        const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const splitChoices = message.embeds[0].description!.split('\n');
        const cleanChoices = splitChoices
            .filter((e) => e)
            .map((e) => e.substring(3, e.length));

        const reactCount = message.reactions.cache
            .filter((emote) => numbers.includes(emote.emoji.name!))
            .map((e) => e.count - 1);
        for (const num of reactCount) {
            sum += num;
        }

        for (let j = 0; j < reactCount.length; j++) {
            let plural = 'votes';
            const v = Math.fround(reactCount[j] / sum);
            const amount = Math.round(v * 20);

            let percent: string = Math.fround(v * 100).toFixed(2);
            let bar = '▓'.repeat(amount) + '░'.repeat(20 - amount);

            if (reactCount[j] === 1) plural = 'vote';
            if (sum === 0) {
                percent = '0';
                bar = '░'.repeat(20);
            }

            const index = `**${cleanChoices[j]}**\n${bar} ${percent}% (${reactCount[j]} ${plural})`;
            results.push(index);
        }
        return results;
    }
}
