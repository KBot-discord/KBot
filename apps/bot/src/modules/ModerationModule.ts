import { ModerationAction } from '#structures/ModerationAction';
import { MuteService, LockedChannelService, AntiHoistService, ModerationCaseService, ModerationSettingsService } from '#services/moderation';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { GuildMember } from 'discord.js';
import type { UpsertModerationSettingsData } from '#types/database';
import type { ModerationSettings } from '#prisma';

@ApplyOptions<Module.Options>({
	fullName: 'Moderation Module'
})
export class ModerationModule extends Module {
	public readonly settings: ModerationSettingsService;
	public readonly antiHoist: AntiHoistService;
	public readonly cases: ModerationCaseService;
	public readonly lockedChannels: LockedChannelService;
	public readonly mutes: MuteService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.antiHoist = new AntiHoistService();
		this.settings = new ModerationSettingsService();
		this.cases = new ModerationCaseService();
		this.lockedChannels = new LockedChannelService();
		this.mutes = new MuteService();

		this.container.moderation = this;
	}

	public async isEnabled({ guild }: IsEnabledContext) {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<ModerationSettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertModerationSettingsData): Promise<ModerationSettings> {
		return this.settings.upsert({ guildId }, data);
	}

	public async checkExistingMute(member: GuildMember, config: ModerationSettings): Promise<boolean> {
		const client = await member.guild.members.fetchMe();
		if (!config.enabled || !client.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return false;
		}

		const existingMute = await this.mutes.get({
			guildId: member.guild.id,
			userId: member.id
		});
		if (isNullish(existingMute)) return false;

		await new ModerationAction(config, await member.guild.members.fetchMe()) //
			.mute(member, {
				reason: 'Mute evasion prevention.',
				sendDm: true,
				silent: false,
				expiresIn:
					existingMute.duration && existingMute.evadeTime //
						? Number(existingMute.duration - existingMute.evadeTime)
						: undefined
			});

		return true;
	}

	public static formatMinageMessage(message: string, member: GuildMember, req: number, reqDate: number): string {
		const stampDays = `<t:${Math.floor(reqDate / 1000)}:R>`;
		const stampDate = `<t:${Math.floor(reqDate / 1000)}:D>`;

		return message
			.replaceAll('{server}', `**${member.guild.name}**`)
			.replaceAll('{req}', `**${req}**`)
			.replaceAll('{days}', `${stampDays}`)
			.replaceAll('{date}', `${stampDate}`);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		ModerationModule: never;
	}
}
