import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { imageFolder } from '../../lib/utilities/constants.js';
import { getMemberAvatarUrl } from '../../lib/utilities/discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { GifEncoder } from '@skyra/gifenc';
import { Canvas, loadImage } from 'canvas-constructor/cairo';
import { ApplicationCommandType, AttachmentBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import { join } from 'node:path';
import { readdirSync } from 'fs';
import { buffer } from 'node:stream/consumers';
import type { Image } from 'canvas-constructor/cairo';
import type { CoreModule } from '../../modules/CoreModule.js';

type PatOptions = {
	resolution?: number;
	delay?: number;
};

type Dimentions = {
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
};

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'Creates a pat gif of the member.',
	preconditions: ['Defer'],
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
		const user = interaction.options.getUser('user', true);
		const member = await interaction.guild.members.fetch(user.id);

		const cache = await this.container.redis.get<string>(this.cacheKey(member.id));
		if (cache !== null) {
			const gif = Buffer.from(cache, 'utf-8');
			return await interaction.editReply({
				files: [new AttachmentBuilder(gif, { name: 'pat.gif' })]
			});
		}

		const avatar = getMemberAvatarUrl(member);
		const gif = await this.createPatGif(avatar, { resolution: 64 });

		await this.container.redis.setEx<string>(
			this.cacheKey(member.id), //
			gif.toString(),
			Time.Minute * 5
		);

		return await interaction.editReply({
			files: [new AttachmentBuilder(gif, { name: 'pat.gif' })]
		});
	}

	/**
	 * Create a pat GIF from a user's avatar.
	 * @param avatarURL - The user's avatar URL
	 * @param options - The GIF options
	 */
	public async createPatGif(avatarURL: string, options: PatOptions = {}): Promise<Buffer> {
		const { resolution = 64, delay = 25 } = options;

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
		return await buffer(stream);
	}

	public override async onLoad(): Promise<void> {
		await Promise.all(
			readdirSync(join(imageFolder, 'pat')).map(async (file) => {
				this.pats.push(await loadImage(join(imageFolder, `pat/${file}`)));
			})
		);
	}

	/**
	 * Calculate the frame dimentions from the iteration.
	 * @param iteration - The current iteration
	 * @param frames - The total amount of frames
	 */
	private calculateDimensions(iteration: number, frames: number): Dimentions {
		const j =
			iteration < frames / 2 //
				? iteration
				: frames - iteration;

		const width = 0.8 + j * 0.02;
		const height = 0.8 - j * 0.05;

		return {
			width,
			height,
			offsetX: (1 - width) * 0.5 + 0.1,
			offsetY: 1 - height - 0.08
		};
	}

	private readonly cacheKey = (userId: string): string => `pat:target:${userId}`;
}
