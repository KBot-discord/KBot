import { RoleService, GetRolesResponse, Role } from '#rpc/bot';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';

export function getDiscordRoleHandlers(): Handler[] {
	return [getRolesHandler];
}

export const getRolesHandler = createHandler(
	RoleService, //
	RoleService.methods.getRoles,
	async ({ guildId }): Promise<GetRolesResponse> => {
		try {
			const guild = await container.client.guilds.fetch(guildId);

			const fetchedRoles = await guild.roles.fetch();
			const roles = fetchedRoles //
				.map(({ id, name, position, color }) => {
					return new Role({ id, name, position, color: `${color}` });
				});

			return new GetRolesResponse({ roles });
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetRolesResponse();
		}
	}
);
