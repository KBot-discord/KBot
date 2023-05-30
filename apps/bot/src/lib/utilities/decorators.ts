import { createMethodDecorator } from '@sapphire/decorators';
import { RateLimitManager } from '@sapphire/ratelimits';
import humanizeDuration from 'humanize-duration';
import { Option } from '@sapphire/framework';
import type { ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

/**
 * Ensures that the interaction handler only handles the passed custom IDs.
 * @param customIds - The custom IDs to allow
 */
export function validCustomId(...customIds: string[]): MethodDecorator {
	return createMethodDecorator((_target: any, _property: any, descriptor: any) => {
		const method = descriptor.value;
		if (typeof method !== 'function') {
			throw new Error('This can only be used on class methods');
		}

		descriptor.value = async function setValue(
			this: (...args: any[]) => any,
			interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
		) {
			if (!customIds.some((id) => interaction.customId.startsWith(id))) {
				return Option.none;
			}

			return method.call(this, interaction);
		} as unknown as undefined;
	});
}

/**
 * Rate limit interactions based on the custom ID and user.
 * @param time - The time between bucket resets
 * @param limit - The size of the bucket between resets
 */
export function interactionRatelimit(time: number, limit: number): MethodDecorator {
	const manager = new RateLimitManager(time, limit);

	return createMethodDecorator((_target: any, _property: any, descriptor: any) => {
		const method = descriptor.value;
		if (typeof method !== 'function') {
			throw new Error('This can only be used on class methods');
		}

		descriptor.value = async function setValue(
			this: (...args: any[]) => any,
			interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
		) {
			const bucket = manager.acquire(`${interaction.customId}:${interaction.user.id}`);

			if (bucket.limited) {
				await interaction.errorReply(
					`You are using that too fast. Try again in ${humanizeDuration(bucket.remainingTime, {
						maxDecimalPoints: 0
					})}`,
					{ tryEphemeral: true }
				);
				return Option.none;
			}

			bucket.consume();
			return method.call(this, interaction);
		} as unknown as undefined;
	});
}
