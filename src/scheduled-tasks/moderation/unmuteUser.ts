import { ModerationAction } from '#lib/structures/ModerationAction';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { UnmuteUserPayload } from '#types/Tasks';

@ApplyOptions<ScheduledTask.Options>({
	name: 'unmuteUser'
})
export class LockedChannelTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run({ guildId, userId }: UnmuteUserPayload): Promise<void> {
		const { client, moderation } = this.container;

		const guild = await client.guilds.fetch(guildId);
		if (isNullish(guild)) return;

		const member = await guild.members.fetch(userId);

		if (isNullish(member)) return;

		const settings = await moderation.getSettings(guildId);
		if (isNullish(settings) || isNullish(settings.muteRoleId)) return;

		const muted = await moderation.mutes.isMuted(member, settings.muteRoleId);
		if (!muted) return;

		const reason = 'Automatic unmute.';
		const sendDm = true;
		const silent = false;

		await new ModerationAction(settings, await guild.members.fetchMe()) //
			.unmute(member, { reason, sendDm, silent });
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		unmuteUser: never;
	}
}
