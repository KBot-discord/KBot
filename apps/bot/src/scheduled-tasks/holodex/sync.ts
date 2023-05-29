import { MeiliCategories } from '@kbotdev/meili';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import type { HolodexChannel } from '@kbotdev/holodex';

@ApplyOptions<ScheduledTask.Options>({
	name: 'holodexSync',
	pattern: '0 0 0 * * 6', // Every saturday
	enabled: !container.config.isDev
})
export class HolodexTask extends ScheduledTask {
	public override async run(): Promise<void> {
		const { prisma, holodex, meili, logger, metrics } = this.container;

		let page = 0;
		let pagesLeft = true;
		const channels: HolodexChannel[] = [];

		const fetchChannels = async (): Promise<void> => {
			const fetchedChannels = await holodex.channels.getList({
				offset: page * 100
			});

			channels.push(...fetchedChannels);

			page++;
			pagesLeft = fetchedChannels.length === 100;
		};

		logger.debug('[HolodexTask] Syncing channels');

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (pagesLeft) {
			await fetchChannels();
		}

		metrics.incrementHolodex({ value: page });

		logger.debug(`[HolodexTask] Synced ${channels.length} channels (pages: ${page})`);

		const twitchFilter = await prisma.twitchConflict.groupBy({
			by: ['channelId']
		});

		const validTwitchChannels = channels.filter(
			({ twitch, id }) =>
				twitch !== null &&
				!twitchFilter.some(({ channelId }) => {
					return id === channelId;
				})
		);

		let shouldContinue = true;
		const uniqueTwitch = new Set<string>();
		const checkedIds = new Set<string>();

		for (const channel of validTwitchChannels) {
			if (!uniqueTwitch.has(channel.twitch!)) {
				uniqueTwitch.add(channel.twitch!);
			} else if (!checkedIds.has(channel.twitch!)) {
				checkedIds.add(channel.twitch!);

				if (shouldContinue) shouldContinue = false;

				const dupes = channels.filter((ch) => ch.twitch === channel.twitch!);

				await logger
					.webhookError((builder) =>
						builder
							.setAuthor('Holodex Twitch conflict error')
							.setTitle('Please add an entry to config.holodex.twitchConflicts')
							.setDescription(dupes.map((entry) => `${entry.name} (ID: ${entry.id})`).join('\n'))
					)
					.catch((error) => {
						logger.sentryError(error);
					});
			}
		}

		if (!shouldContinue) return;

		await meili.upsertMany(
			MeiliCategories.YoutubeChannels,
			channels.map(({ id, name, english_name, org, suborg, group }) => {
				return { id, name, englishName: english_name, org, subOrg: suborg, group };
			})
		);

		await prisma.$transaction(
			channels.map((channel) => {
				const result = twitchFilter.some(({ channelId }) => {
					return channel.id === channelId;
				});
				const data = {
					twitchId: result ? null : channel.twitch,
					name: channel.name,
					englishName: channel.english_name,
					image: channel.photo
				};
				return prisma.holodexChannel.upsert({
					where: { youtubeId: channel.id },
					update: data,
					create: { ...data, youtubeId: channel.id }
				});
			})
		);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface ScheduledTasks {
		holodexSync: never;
	}
}
