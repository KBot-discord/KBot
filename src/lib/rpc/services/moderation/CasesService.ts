import { CasesService, GetUserCasesResponse, GetGuildCasesResponse, UpdateCaseResponse } from '#rpc/bot';
import { fromRequired } from '#lib/rpc/utils';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getModerationCasesHandlers(): Handler[] {
	return [getUserCasesHandler, getGuildCasesHandler, updateCaseHandler];
}

export const getUserCasesHandler = createHandler(
	CasesService,
	CasesService.methods.getUserCases,
	async ({ userId, guildId }): Promise<GetUserCasesResponse> => {
		try {
			const moderationCases = await container.moderation.cases.getUserCases(guildId, userId);

			const data: PartialMessage<GetUserCasesResponse> = { cases: moderationCases };

			return new GetUserCasesResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetUserCasesResponse();
		}
	}
);

export const getGuildCasesHandler = createHandler(
	CasesService,
	CasesService.methods.getGuildCases,
	async ({ guildId }): Promise<GetGuildCasesResponse> => {
		try {
			const moderationCases = await container.moderation.cases.getGuildCases(guildId);

			const data: PartialMessage<GetGuildCasesResponse> = { cases: moderationCases };

			return new GetGuildCasesResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetGuildCasesResponse();
		}
	}
);

export const updateCaseHandler = createHandler(
	CasesService,
	CasesService.methods.updateCase,
	async ({ caseId, guildId, reason }): Promise<UpdateCaseResponse> => {
		try {
			const moderationCase = await container.moderation.cases.updateCase(guildId, caseId, {
				reason: fromRequired(reason)
			});

			const data: PartialMessage<UpdateCaseResponse> = { case: moderationCase };

			return new UpdateCaseResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateCaseResponse();
		}
	}
);
