import { MeiliCategories } from '#types/Meili';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import type { HolodexChannel } from '@kbotdev/holodex';

@ApplyOptions<ScheduledTask.Options>({
	name: 'holodexSync',
	pattern: '0 0 0 * * 6' // Every saturday
})
export class HolodexTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const { prisma, holodex, meili, logger, config } = this.container;

		let page = 0;
		let pagesLeft = true;
		const channels: HolodexChannel[] = [];

		try {
			const fetchChannels = async () => {
				const fetchedChannels = await holodex.channels.getList({
					offset: page * 100
				});

				logger.debug(`[HolodexTask] Fetched ${fetchedChannels.length} channels (page: ${page + 1})`);

				channels.push(...fetchedChannels);

				page++;
				pagesLeft = fetchedChannels.length === 100;
			};

			logger.debug('[HolodexTask] Syncing channels');

			while (pagesLeft) {
				await fetchChannels();
			}

			logger.debug(`[HolodexTask] Synced ${channels.length} channels`);

			await meili.upsertMany(
				MeiliCategories.YoutubeChannels,
				channels.map(({ id, name, english_name, org, suborg, group }) => {
					return { id, name, englishName: english_name, org, subOrg: suborg, group };
				})
			);

			await meili.upsertMany(
				MeiliCategories.TwitchChannels,
				channels
					.filter(
						({ twitch, id }) =>
							twitch !== null &&
							config.holodex.twitchConflicts.some((channelId) => {
								return id === channelId;
							})
					)
					.map(({ twitch, name, english_name, org, suborg, group }) => {
						return { id: twitch!, name, englishName: english_name, org, subOrg: suborg, group };
					})
			);

			await prisma.$transaction(
				channels.map((channel) => {
					const result = config.holodex.twitchConflicts.some((channelId) => {
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
		} catch (err: unknown) {
			logger.error(err);
		}
	}
}
