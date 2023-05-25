import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.WebhookError
})
export class CustomListener extends Listener<typeof KBotErrors.WebhookError> {
	public async run(error: unknown): Promise<void> {
		this.container.logger.sentryError(error);
	}
}
