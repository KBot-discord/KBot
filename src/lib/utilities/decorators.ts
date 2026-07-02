import { createMethodDecorator } from '@sapphire/decorators';
import { Option } from '@sapphire/framework';
import type { ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

/**
 * Ensures that the interaction handler only handles the passed custom IDs.
 * @param customIds - The custom IDs to allow
 */
export function validCustomId(...customIds: string[]): MethodDecorator {
	// biome-ignore lint/suspicious/noExplicitAny: Decorators are fun
	return createMethodDecorator((_target: any, _property: any, descriptor: any) => {
		const method = descriptor.value;
		if (typeof method !== 'function') {
			throw new Error('This can only be used on class methods');
		}

		descriptor.value = function setValue(
			// biome-ignore lint/suspicious/noExplicitAny: Decorators are fun
			this: (...args: any[]) => any,
			interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction,
		) {
			if (!customIds.some((id) => interaction.customId.startsWith(id))) {
				return Option.none;
			}

			return method.call(this, interaction);
		} as unknown as undefined;
	});
}
