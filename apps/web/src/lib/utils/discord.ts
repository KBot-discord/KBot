import type { User } from '$lib/types/app';

export function createDefaultAvatar(user: User | null): string {
	const discriminator = user?.discriminator
		? Number(user?.discriminator)
		: Math.floor(Math.random() * 9999) + 1;
	return `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png?size=512`;
}

export function getGuildInitials(guildName: string): string {
	const allNames = guildName.trim().split(' ');
	return allNames.reduce((acc, curr, index) => {
		if (index === 0 || index === allNames.length - 1) {
			acc = `${acc}${curr.charAt(0).toUpperCase()}`;
		}
		return acc;
	}, '');
}
