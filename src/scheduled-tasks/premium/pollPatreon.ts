import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 */1 * * * *', // Every minute
	enabled: false
})
export class PremiumTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		await this.container.premium.patreon.run();
	}
}
