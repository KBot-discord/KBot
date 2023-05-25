import { imageFolder } from '#utils/constants';
import { getMemberAvatarUrl } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { GifEncoder } from '@skyra/gifenc';
import { Canvas, loadImage } from 'canvas-constructor/cairo';
import { AttachmentBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { join } from 'node:path';
import { readdirSync } from 'fs';
import { buffer } from 'node:stream/consumers';
import type { CoreModule } from '#modules/CoreModule';
import type { Image } from 'canvas-constructor/cairo';

type PatOptions = {
	resolution?: number;
	delay?: number;
};

@ApplyOptions<KBotCommand.Options>({
	module: 'CoreModule',
	description: 'Creates a pat gif of the member.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Pat')
			.setTarget('user');
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	private readonly pats: Image[] = [];

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('Pat')
					.setType(ApplicationCommandType.User)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async contextMenuRun(interaction: KBotCommand.ContextMenuCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const user = interaction.options.getUser('user', true);
		const member = await interaction.guild.members.fetch(user.id);
		const avatar = getMemberAvatarUrl(member);

		const gif = await this.createPatGif(avatar, { resolution: 64 });

		return interaction.editReply({
			files: [new AttachmentBuilder(gif, { name: 'Pat.gif' })]
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

	public override async onLoad(): Promise<void> {
		await Promise.all(
			readdirSync(join(imageFolder, 'pat')).map(async (file) => {
				this.pats.push(await loadImage(join(imageFolder, `pat/${file}`)));
			})
		);
	}

	private calculateDimensions(
		i: number,
		frames: number
	): {
		width: number;
		height: number;
		offsetX: number;
		offsetY: number;
	} {
		const j =
			i < frames / 2 //
				? i
				: frames - i;

		const width = 0.8 + j * 0.02;
		const height = 0.8 - j * 0.05;

		return {
			width,
			height,
			offsetX: (1 - width) * 0.5 + 0.1,
			offsetY: 1 - height - 0.08
		};
	}
}
