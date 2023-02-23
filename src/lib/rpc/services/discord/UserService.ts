import { UserService, GetUserResponse, User } from '#rpc/bot';
import { getUserAvatarUrl } from '#utils/Discord';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';

export function getDiscordUserHandlers(): Handler[] {
	return [getUserHandler];
}

export const getUserHandler = createHandler(
	UserService, //
	UserService.methods.getUser,
	async ({ userId }): Promise<GetUserResponse> => {
		try {
			const fetchedUser = await container.client.users.fetch(userId);

			const avatar = getUserAvatarUrl(fetchedUser);

			const user = new User({
				id: fetchedUser.id,
				username: fetchedUser.username,
				discriminator: fetchedUser.discriminator,
				avatar
			});

			return new GetUserResponse({ user });
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetUserResponse();
		}
	}
);
