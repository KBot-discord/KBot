import { isNullOrUndefined } from '#lib/utilities/functions';
import { validCustomId } from '#lib/utilities/decorators';
import { YoutubeCustomIds } from '#lib/utilities/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { PermissionFlagsBits, StringSelectMenuInteraction, roleMention } from 'discord.js';
import type { HolodexChannel } from '@prisma/client';

@ApplyOptions<InteractionHandler.Options>({
	name: YoutubeCustomIds.RoleReaction,
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class ButtonHandler extends InteractionHandler {
	public override async run(
		interaction: StringSelectMenuInteraction<'cached'>,
		{ selectedChannels, member }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const subscriptions = await this.container.youtube.subscriptions.getByGuild(interaction.guildId);

		const invalidRoleIds: Set<string> = new Set();
		const userRoles = interaction.member.roles.cache;
		const bot = await interaction.guild.members.fetchMe();

		const roleIds: {
			channel: HolodexChannel;
			roleId: string;
		}[] = subscriptions //
			.filter(({ roleId, memberRoleId }) => (member ? !isNullOrUndefined(memberRoleId) : !isNullOrUndefined(roleId)))
			.map(({ channel, roleId, memberRoleId }) => ({
				channel,
				roleId: (member ? memberRoleId : roleId)!
			}));

		for (const { roleId } of roleIds) {
			const role = await interaction.guild.roles.fetch(roleId);
			if (role && bot.roles.highest.position <= role.position) {
				invalidRoleIds.add(role.id);
			}
		}

		const selectedRoles = roleIds //
			.filter(({ channel }) => selectedChannels.includes(channel.youtubeId));

		const rolesToAdd = new Set<string>(
			selectedRoles //
				.filter(
					({ roleId }) =>
						!userRoles.has(roleId) && //
						!invalidRoleIds.has(roleId)
				)
				.map(({ roleId }) => roleId)
		);

		const rolesToRemove = new Set<string>(
			roleIds //
				.filter(
					({ roleId }) =>
						userRoles.has(roleId) && //
						!selectedRoles.some((sub) => sub.roleId === roleId) &&
						!invalidRoleIds.has(roleId)
				)
				.map(({ roleId }) => roleId)
		);

		if (invalidRoleIds.size > 0) {
			await interaction.errorFollowup(
				`I was not able to add/remove the following roles due to them being higher than my highest role:\n\n${[...invalidRoleIds.values()]
					.map((roleId) => roleMention(roleId))
					.join(' ')}`,
				{ ephemeral: true }
			);
		}

		await interaction.member.roles.add([...rolesToAdd.values()]);
		await interaction.member.roles.remove([...rolesToRemove.values()]);
	}

	@validCustomId(YoutubeCustomIds.RoleReaction, YoutubeCustomIds.RoleReactionMember)
	public override async parse(interaction: StringSelectMenuInteraction<'cached'>) {
		const bot = await interaction.guild.members.fetchMe();
		if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
			await interaction.defaultReply("I don't have the required permissions to edit your roles.", {
				tryEphemeral: true
			});
			return this.none();
		}

		await interaction.deferUpdate();

		return this.some({
			selectedChannels: interaction.values,
			member: interaction.customId === YoutubeCustomIds.RoleReactionMember
		});
	}
}
