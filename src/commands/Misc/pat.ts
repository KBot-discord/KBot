import { imageFolder } from '#utils/constants';
import { getMemberAvatarUrl, getUserAvatarUrl } from '#utils/util';
import { getGuildIds } from '#utils/config';
import { Command, type ContextMenuCommand } from '@sapphire/framework';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { GifEncoder } from '@skyra/gifenc';
import { Canvas, loadImage, Image } from 'canvas-constructor/cairo';
import { AttachmentBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { join } from 'node:path';
import { buffer } from 'node:stream/consumers';
import { readdirSync } from 'fs';

interface PatOptions {
	resolution?: number;
	delay?: number;
}

@ApplyOptions<ContextMenuCommand.Options>({
	detailedDescription: '(Used on members) Makes and sends a pat emote.',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]
})
export class MiscCommand extends Command {
	private pats: Image[] = [];

	public constructor(context: ContextMenuCommand.Context, options: ContextMenuCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('Pat')
					.setType(ApplicationCommandType.User),
			{ idHints: ['1037026182975193132'], guildIds: getGuildIds() }
		);
	}

	public async contextMenuRun(interaction: ContextMenuCommand.Interaction) {
		await interaction.deferReply();

		let avatar: string;
		let username: string;
		const member = await interaction.guild!.members.fetch(interaction.targetId).catch(() => null);
		if (isNullish(member)) {
			const user = interaction.options.getUser('user', true);
			({ username } = user);
			avatar = getUserAvatarUrl(user);
		} else {
			({ username } = member.user);
			avatar = getMemberAvatarUrl(member);
		}

		const gif = await this.createPatGif(avatar, { resolution: 64 });

		return interaction.editReply({
			files: [new AttachmentBuilder(gif, { name: `${username}Pat.gif` })]
		});
	}

	public async createPatGif(avatarURL: string, { resolution = 64, delay = 25 }: PatOptions = {}): Promise<Buffer> {
		const frames = this.pats.length * 2;
		const encoder = new GifEncoder(resolution, resolution);
		const canvas = new Canvas(resolution, resolution);

		const stream = encoder.createReadStream();
		encoder.setRepeat(0).setDelay(delay).setTransparent(100).start();

		const avatar = await loadImage(avatarURL);

		for (let i = 0; i < frames; i++) {
			const { width, height, offsetX, offsetY } = this.calculateDimensions(i, frames);

			const frame = canvas
				.clearRectangle(0, 0, resolution, resolution)
				.printImage(avatar, resolution * offsetX, resolution * offsetY, resolution * width, resolution * height)
				.printImage(this.pats[Math.floor(i / 2)], 0, 0, resolution, resolution)
				.getImageData().data;

			encoder.addFrame(frame);
		}

		encoder.finish();
		return buffer(stream);
	}

	public calculateDimensions(i: number, frames: number) {
		const j = i < frames / 2 ? i : frames - i;
		const width = 0.8 + j * 0.02;
		const height = 0.8 - j * 0.05;
		return {
			width,
			height,
			offsetX: (1 - width) * 0.5 + 0.1,
			offsetY: 1 - height - 0.08
		};
	}

	public async onLoad() {
		await Promise.all(
			readdirSync(join(imageFolder, 'pat')).map(async (file) => {
				this.pats.push(await loadImage(join(imageFolder, `pat/${file}`)));
			})
		);
	}
}
