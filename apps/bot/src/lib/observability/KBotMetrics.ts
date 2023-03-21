import { container } from '@sapphire/framework';
import { Counter, Gauge, register } from 'prom-client';
import type { KBotCounters } from '#types/Metrics';

export class KBotMetrics {
	private readonly counters: KBotCounters;

	public constructor() {
		this.setupGauges();

		this.counters = {
			commands: new Counter({
				name: 'kbot_bot_commands_total',
				help: 'Counter for total amount of command uses.',
				registers: [register],
				labelNames: ['command'] as const
			}),
			twitch: new Counter({
				name: 'kbot_bot_youtube_notifications_total',
				help: 'Counter for total amount of youtube notifications.',
				registers: [register],
				labelNames: ['success'] as const
			}),
			youtube: new Counter({
				name: 'kbot_bot_twitch_notifications_total',
				help: 'Counter for total amount of youtube notifications.',
				registers: [register],
				labelNames: ['success'] as const
			})
		};
	}

	public incrementCommand({ command, value = 1 }: { command: string; value?: number }) {
		this.counters.commands.inc({ command }, value);
	}

	public incrementTwitch({ success, value = 1 }: { success: boolean; value?: number }) {
		this.counters.twitch.inc({ success: `${success}` }, value);
	}

	public incrementYoutube({ success, value = 1 }: { success: boolean; value?: number }) {
		this.counters.youtube.inc({ success: `${success}` }, value);
	}

	private setupGauges(): void {
		new Gauge({
			name: 'kbot_bot_guilds_total',
			help: 'Gauge for total amount of guilds.',
			registers: [register],
			collect() {
				if (container.client.isReady()) {
					this.set(container.client.guilds.cache.size);
				}
			}
		});

		new Gauge({
			name: 'kbot_bot_users_total',
			help: 'Gauge for total amount of users.',
			registers: [register],
			collect() {
				if (container.client.isReady()) {
					this.set(
						container.client.guilds.cache //
							.reduce((acc, guild) => acc + guild.memberCount, 0)
					);
				}
			}
		});
	}
}
