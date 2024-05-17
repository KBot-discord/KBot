import { container } from '@sapphire/framework';
import { Counter, Gauge, register } from 'prom-client';

type KBotCounters = {
	commands: Counter;
	youtube: Counter;
	holodex: Counter;
};

export class KBotMetrics {
	private readonly counters: KBotCounters;

	public constructor() {
		this.setupGauges();

		this.counters = {
			commands: new Counter({
				name: 'kbot_bot_commands_total',
				help: 'Counter for total amount of command uses.',
				registers: [register],
				labelNames: ['command', 'success'] as const,
			}),
			youtube: new Counter({
				name: 'kbot_bot_youtube_notifications_total',
				help: 'Counter for total amount of youtube notifications.',
				registers: [register],
				labelNames: ['success'] as const,
			}),
			holodex: new Counter({
				name: 'kbot_bot_holodex_api_requests_total',
				help: 'Counter for total amount of holodex requests.',
				registers: [register],
			}),
		};
	}

	/**
	 * Increment the command counter.
	 * @param data - The data to increment the counter
	 */
	public incrementCommand(data: { command: string; success: boolean; value?: number }): void {
		const { command, success, value = 1 } = data;

		this.counters.commands.inc({ command, success: String(success) }, value);
	}

	/**
	 * Increment the YouTube notification counter.
	 * @param data - The data to increment the counter
	 */
	public incrementYoutube({ success, value = 1 }: { success: boolean; value?: number }): void {
		this.counters.youtube.inc({ success: String(success) }, value);
	}

	/**
	 * Increment the Holodex API counter.
	 * @param data - The data to increment the counter
	 */
	public incrementHolodex({ value = 1 }: { value?: number } = {}): void {
		this.counters.holodex.inc(value);
	}

	private setupGauges(): void {
		new Gauge({
			name: 'kbot_bot_guilds_total',
			help: 'Gauge for total amount of guilds.',
			registers: [register],
			collect(): void {
				if (container.client.isReady()) {
					this.set(container.client.guilds.cache.size);
				}
			},
		});

		new Gauge({
			name: 'kbot_bot_users_total',
			help: 'Gauge for total amount of users.',
			registers: [register],
			collect(): void {
				if (container.client.isReady()) {
					this.set(container.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
				}
			},
		});

		new Gauge({
			name: 'kbot_bot_karaoke_events_total',
			help: 'Gauge for total amount of karaoke events.',
			registers: [register],
			async collect(): Promise<void> {
				if (container.client.isReady()) {
					this.set(await container.events.karaoke.countEvents());
				}
			},
		});

		new Gauge({
			name: 'kbot_bot_holodex_channels_total',
			help: 'Gauge for total amount of holodex channels.',
			registers: [register],
			async collect(): Promise<void> {
				if (container.client.isReady()) {
					this.set(await container.youtube.channels.count());
				}
			},
		});
	}
}
