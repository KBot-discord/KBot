/**
 * Resources - Add emote/sticker
 */
export const ResourceCustomIds = {
	Emote: 'emote-resource-name' as const,
	Sticker: 'sticker-resource-name' as const,
};

export const ResourceFields = {
	Name: 'resourceName',
} as const;

/**
 * Report
 */
export const ReportCustomIds = {
	Timeout: '@kbotdev/report.timeout' as const,
	Delete: '@kbotdev/report.delete' as const,
	Info: '@kbotdev/report.info' as const,
} as const;
