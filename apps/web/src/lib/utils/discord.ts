export function createDefaultAvatar(): string {
	return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png?size=512`;
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
