import { EmbedColors, Emoji } from '#utils/constants';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import type { UnlockChannelPayload } from '#types/Tasks';
import type { GuildTextBasedChannel } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'unlockChannel'
})
export class LockedChannelTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run({ channelId }: UnlockChannelPayload): Promise<void> {
		const {
			client,
			moderation: { lockedChannels }
		} = this.container;

		const lockEntry = await lockedChannels.get({ discordChannelId: channelId });
		if (isNullish(lockEntry)) return;

		const channel = (await client.channels.fetch(channelId)) as GuildTextBasedChannel | null;
		if (isNullish(channel) || (channel.isThread() && isNullish(channel.parentId))) {
			await lockedChannels.delete({ discordChannelId: channelId });
			return;
		}

		await lockedChannels.setChannelMessagePermissions(channel, lockEntry.roleId, null);

		await lockedChannels.delete({ discordChannelId: channel.id });

		await channel.send({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.setTitle(`${Emoji.Unlocked} ${channel.name} has been unlocked`)
			]
		});
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		unlockChannel: never;
	}
}
