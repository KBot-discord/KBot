import { PremiumService, GetPremiumUserRequest, GetGuildPremiumStatusRequest, GetPremiumUserResponse, GetGuildPremiumStatusResponse } from '#rpc/bot';
import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import dayjs from 'dayjs';
import type { Guild } from 'discord.js';
import type { PremiumClaim } from '../../bot';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerPremiumService(router: ConnectRouter) {
	router.service(PremiumService, new PremiumServiceImpl());
}

class PremiumServiceImpl implements ServiceImpl<typeof PremiumService> {
	@authenticated()
	public async getPremiumUser(_req: GetPremiumUserRequest, { auth, error }: HandlerContext): Promise<GetPremiumUserResponse> {
		const { logger, client, premium } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		try {
			const user = await premium.users.get({
				userId: auth.id
			});

			const claims = await premium.claims.getByUser({ userId: auth.id });

			const claimsWithGuilds: { claim: Partial<PremiumClaim>; guild: Guild }[] = claims
				.map((claim) => {
					return {
						claim: {},
						guild: client.guilds.cache.get(claim.guildId)!
					};
				})
				.filter(({ guild }) => Boolean(guild));

			const data: PartialMessage<GetPremiumUserResponse> = {
				user: user ? { totalClaims: user.totalClaims } : undefined,
				claims: claimsWithGuilds.map(({ claim, guild }) => ({
					guildId: guild.id,
					guildName: guild.name,
					guildIcon: guild.icon ?? undefined,
					startDate: claim.startDate,
					endDate: claim.endDate
				}))
			};

			return new GetPremiumUserResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async getGuildPremiumStatus(
		{ guildId }: GetGuildPremiumStatusRequest,
		{ auth, error }: HandlerContext
	): Promise<GetGuildPremiumStatusResponse> {
		const { logger, client, premium } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = await client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const claims = await premium.claims.getByGuild({ guildId });

			let timeLeft = 0;
			for (const { endDate, startDate } of claims) {
				if (endDate && startDate) {
					const diff = dayjs(endDate).diff(startDate);
					timeLeft += diff;
				}
			}

			const data: PartialMessage<GetGuildPremiumStatusResponse> = {
				isPremium: claims.length > 0,
				timeLeft
			};

			return new GetGuildPremiumStatusResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
