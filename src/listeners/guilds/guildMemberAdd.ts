import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { MinageService } from '../../services/MinageService';
import { WelcomeService } from '../../services/WelcomeService';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildMemberAdd
})
export class GuildListener extends Listener {
	public async run(member: GuildMember) {
		const wasMemberKicked = await new MinageService(member).run();
		if (wasMemberKicked) return;
		return new WelcomeService(member).run();
	}
}
