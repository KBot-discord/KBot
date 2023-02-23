import { container } from '@sapphire/framework';
import { Counter, Gauge, register } from 'prom-client';

export class KBotMetrics {
	private readonly counters;

	public constructor() {
		this.setupGauges();

		this.counters = {
			commands: new Counter({
				name: 'kbot_bot_commands_total',
				help: 'Counter for total amount of command uses.',
				registers: [register],
				labelNames: ['command'] as const
			})
		};
	}

	public incrementCommand({ command, value }: { command: string; value: number }) {
		this.counters.commands.inc({ command }, value);
	}

	private setupGauges(): void {
		// Guild count
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

		// User count
		new Gauge({
			name: 'kbot_bot_users_total',
			help: 'Gauge for total amount of users.',
			registers: [register],
			collect() {
				if (container.client.isReady()) {
					this.set(container.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
				}
			}
		});

		// Subscriptions
		new Gauge({
			name: 'kbot_bot_twitch_accounts_total',
			help: 'Gauge for total amount of twitch accounts.',
			registers: [register],
			async collect() {
				if (container.client.isReady()) {
					this.set(await container.notifications.twitch.countAccounts());
				}
			}
		});
	}
}
