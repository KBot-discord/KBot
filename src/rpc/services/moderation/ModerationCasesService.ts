import {
	GetGuildModerationCasesResponse,
	UpdateModerationCaseResponse,
	ModerationCasesService,
	UpdateModerationCaseRequest,
	GetGuildModerationCasesRequest
} from '#rpc/bot';
import { fromRequired } from '#rpc/utils';
import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerModerationCasesService(router: ConnectRouter) {
	router.service(ModerationCasesService, new ModerationCasesServiceImpl());
}

class ModerationCasesServiceImpl implements ServiceImpl<typeof ModerationCasesService> {
	@authenticated()
	public async getGuildModerationCases(
		{ guildId }: GetGuildModerationCasesRequest,
		{ auth, error }: HandlerContext
	): Promise<GetGuildModerationCasesResponse> {
		const { logger, client, moderation } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = await client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const moderationCases = await moderation.cases.getByGuild({ guildId });

			const data: PartialMessage<GetGuildModerationCasesResponse> = { cases: moderationCases };

			return new GetGuildModerationCasesResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateModerationCase(
		{ caseId, guildId, reason }: UpdateModerationCaseRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateModerationCaseResponse> {
		const { logger, client, moderation } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = await client.guilds.cache.get(guildId);
		if (!guild) throw new ConnectError('Bad request', 400);

		const member = await guild.members.fetch(auth.id).catch(() => null);
		if (!member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const moderationCase = await moderation.cases.update(
				{ guildId, caseId },
				{
					reason: fromRequired(reason)
				}
			);

			const data: PartialMessage<UpdateModerationCaseResponse> = { case: moderationCase };

			return new UpdateModerationCaseResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
