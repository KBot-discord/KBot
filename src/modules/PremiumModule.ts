import { PatreonService, PremiumClaimService, PremiumUserService } from '#services/premium';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Module.Options>({
	fullName: 'Premium Module'
})
export class PremiumModule extends Module {
	public readonly claims: PremiumClaimService;
	public readonly users: PremiumUserService;
	public readonly patreon: PatreonService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.claims = new PremiumClaimService();
		this.users = new PremiumUserService();
		this.patreon = new PatreonService();

		this.container.premium = this;
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		PremiumModule: never;
	}
}
