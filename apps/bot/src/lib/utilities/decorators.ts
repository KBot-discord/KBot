import { createMethodDecorator } from '@sapphire/decorators';
import { RateLimitManager } from '@sapphire/ratelimits';
import humanizeDuration from 'humanize-duration';
import { Option } from '@sapphire/framework';
import type { ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

export function validCustomId(...customIds: string[]): MethodDecorator {
	return createMethodDecorator((_t: any, _p: any, descriptor: any) => {
		const method = descriptor.value;
		if (!method) throw new Error('Function preconditions require a value.');
		if (typeof method !== 'function') throw new Error('Function preconditions can only be applied to functions.');

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

export function interactionRatelimit(time: number, limit: number): MethodDecorator {
	const manager = new RateLimitManager(time, limit);

	return createMethodDecorator((_t: any, _p: any, descriptor: any) => {
		const method = descriptor.value;
		if (!method) throw new Error('Function preconditions require a value.');
		if (typeof method !== 'function') throw new Error('Function preconditions can only be applied to functions.');

		descriptor.value = async function setValue(
			this: (...args: any[]) => any,
			interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
		) {
			const bucket = manager.acquire(`${interaction.customId}${interaction.user.id}`);

			if (bucket.limited) {
				await interaction.errorReply(
					`You are using that too fast. Try again in ${humanizeDuration(bucket.remainingTime, {
						maxDecimalPoints: 0
					})}`,
					true
				);
				return Option.none;
			}

			bucket.consume();
			return method.call(this, interaction);
		} as unknown as undefined;
	});
}
