import type { ModerationCase } from '#prisma';

export interface CaseByIdAndGuildId {
	caseId: ModerationCase['caseId'];
	guildId: ModerationCase['guildId'];
}

export interface CasesByUserAndGuildId {
	userId: ModerationCase['userId'];
	guildId: ModerationCase['guildId'];
}

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
