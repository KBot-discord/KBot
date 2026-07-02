import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import type { EmojiData, StickerData } from '../lib/types/CustomIds.js';
import { KBotModules } from '../lib/types/Enums.js';

@ApplyOptions<Module.Options>({
	name: KBotModules.Utility,
	fullName: 'Utility Module',
})
export class UtilityModule extends Module {
	private readonly cache = new Map<string, EmojiData | StickerData>();

	public constructor(context: Module.LoaderContext, options: Module.Options) {
		super(context, options);

		this.container.utility = this;
	}

	/**
	 * Persist `Add emote` or `Add sticker` data between modal submissions.
	 * @param messageId - The ID of the message
	 * @param userId - The ID of the user
	 * @param data - The data to set to the cache
	 */
	public setResourceCache(messageId: string, userId: string, data: EmojiData | StickerData): void {
		const key = this.resourceKey(messageId, userId);
		this.cache.set(key, data);
		setTimeout(() => this.cache.delete(key), 1000 * 60 * 60); // Delete after 1 hour
	}

	/**
	 * Get and delete data from the cache.
	 * @param messageId - The ID of the message
	 * @param userId - The ID of the user
	 */
	public popResourceCache<T = EmojiData | StickerData>(messageId: string, userId: string): T | null {
		const key = this.resourceKey(messageId, userId);
		const result = this.cache.get(key);
		if (result) this.cache.delete(key);
		return result as T;
	}

	private readonly resourceKey = (messageId: string, userId: string): string => `add-resource:${messageId}:${userId}`;
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		[KBotModules.Utility]: never;
	}
}
