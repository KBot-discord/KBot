import { MeiliCategories } from '@kbotdev/meili';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { Time } from '@sapphire/duration';

@ApplyOptions<ScheduledTask.Options>({
	name: 'holodexSync',
	pattern: '0 0 0 * * 6', // Every saturday
	enabled: container.config.enableTasks
})
export class HolodexTask extends ScheduledTask {
	public override async run(data: { page: number } | undefined): Promise<void> {
		const { prisma, holodex, meili, logger, metrics } = this.container;

		const page = data ? data.page : 0;

		const channels = await holodex.channels.getList({
			offset: page * 100
		});

		metrics.incrementHolodex({ value: page });

		await meili.upsertMany(
			MeiliCategories.YoutubeChannels,
			channels.map(({ id, name, english_name, org, suborg, group }) => {
				const engName =
					english_name !== null && english_name.length > 0 //
						? english_name
						: null;
				return { id, name, englishName: engName, org, subOrg: suborg, group };
			})
		);

		await prisma.$transaction(
			// eslint-disable-next-line @typescript-eslint/promise-function-async
			channels.map((channel) => {
				const engName =
					channel.english_name !== null && channel.english_name.length > 0 //
						? channel.english_name
						: null;

				const data = {
					name: channel.name,
					englishName: engName,
					image: channel.photo
				};
				return prisma.holodexChannel.upsert({
					where: { youtubeId: channel.id },
					update: data,
					create: { ...data, youtubeId: channel.id }
				});
			})
		);

		if (channels.length === 100) {
			await this.scheduleNextPage(page + 1);
		} else {
			logger.info(`[HolodexSync] Sync complete. (channels: ${page * 100 + channels.length}, pages: ${page + 1})`, {
				task: this.name
			});
		}
	}

	private async scheduleNextPage(page: number): Promise<void> {
		await this.container.tasks.create(
			'holodexSync', //
			{ page },
			{ repeated: false, delay: Time.Second * 30 }
		);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface ScheduledTasks {
		holodexSync: never;
	}
}
