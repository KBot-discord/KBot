import type { ModerationCase } from '#prisma';
import type { GuildId } from '#types/database/index';
import type { Expand } from '#types/Generic';

export type GuildAndCaseId = Expand<GuildId & { caseId: ModerationCase['caseId'] }>;

export type GuildAndUserId = Expand<GuildId & { userId: ModerationCase['userId'] }>;

export interface CreateCaseData {
	guildId: ModerationCase['guildId'];
	userId: ModerationCase['userId'];
	userTag: ModerationCase['userTag'];
	moderatorId: ModerationCase['moderatorId'];
	moderatorTag: ModerationCase['moderatorTag'];
	type: ModerationCase['type'];
	reason?: ModerationCase['reason'];
	duration?: ModerationCase['duration'];
}

export interface UpdateCaseData {
	reason?: ModerationCase['reason'];
}
