import { YoutubeCustomIds } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { StringSelectMenuInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [YoutubeCustomIds.RoleReaction, YoutubeCustomIds.RoleReactionMember];

	public override async run(
		interaction: StringSelectMenuInteraction<'cached'>,
		{ selectedChannels, member }: InteractionHandler.ParseResult<this>
	) {
		const subscriptions = await this.container.youtube.subscriptions.getByGuild({
			guildId: interaction.guildId
		});

		const userRoles = interaction.member.roles.cache;

		const roleIds = subscriptions //
			.filter(({ roleId, memberRoleId }) => (member ? !isNullish(memberRoleId) : !isNullish(roleId)))
			.map(({ channel, roleId, memberRoleId }) => ({ channel, roleId: member ? memberRoleId : roleId }));

		const selectedRoles = roleIds //
			.filter(({ channel }) => selectedChannels.includes(channel.youtubeId));

		const rolesToAdd = new Set<string>(
			selectedRoles //
				.filter(({ roleId }) => !userRoles.has(roleId!))
				.map(({ roleId }) => roleId!)
		);

		const rolesToRemove = new Set<string>(
			roleIds //
				.filter(({ roleId }) => userRoles.has(roleId!) && !selectedRoles.some((sub) => sub.roleId === roleId))
				.map(({ roleId }) => roleId!)
		);

		await interaction.member.roles.add([...rolesToAdd.values()]);
		await interaction.member.roles.remove([...rolesToRemove.values()]);
	}

	public override async parse(interaction: StringSelectMenuInteraction<'cached'>) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();
		await interaction.deferUpdate();

		return this.some({
			selectedChannels: interaction.values,
			member: interaction.customId === YoutubeCustomIds.RoleReactionMember
		});
	}
}
