// Imports
import { ChatInputCommand, Command } from '@sapphire/framework';
import { ApplicationCommandType, PermissionFlagsBits } from "discord-api-types/v10";
import { KBotCommand } from "../../lib/extensions/KBotCommand";
import { ApplyOptions } from "@sapphire/decorators";
import { getMemberAvatarUrl, getUserAvatarUrl } from "../../lib/util/util";
import { GifEncoder } from '@skyra/gifenc';
import { Canvas, loadImage, Image } from 'canvas-constructor/cairo';
import { MessageAttachment } from "discord.js";
import { imageFoler } from "../../lib/util/constants";
import { join } from "node:path";
import { buffer } from 'node:stream/consumers';

// Types
import type { ContextMenuCommand } from '@sapphire/framework';


const DEFAULT_OPTIONS = {
    frames: 10,
}

interface PatOptions {
    frames?: number;
    resolution?: number;
    delay?: number;
}

@ApplyOptions<ChatInputCommand.Options>({
    name: 'Pat',
    detailedDescription: '(Used on members) Makes and sends a pat emote.',
})
export class PatCommand extends KBotCommand {
    private pats: Image[] = [];

    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
        registry.registerContextMenuCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                    .setName(this.name)
                    .setType(ApplicationCommandType.User),
            {
                idHints: super.getIdHints(this.name),
                guildIds: super.getGuildIds(),
            }
        );
    }

    public async contextMenuRun(interaction: Command.ContextMenuInteraction) {
        await interaction.deferReply();

        let avatar: string, username: string;
        const member = await interaction.guild!.members.fetch(interaction.targetId).catch(() => null);
        if (!member) {
            const user = await interaction.options.getUser('user', true);
            username = user.username;
            avatar = await getUserAvatarUrl(user, { defaultFormat: 'png', size: 512 });
        } else {
            username = member.user.username;
            avatar = await getMemberAvatarUrl(member, { defaultFormat: 'png', size: 512 });
        }

        const gif = await this.createPatGif(avatar, { resolution: 64 });

        return await interaction.editReply({
            files: [new MessageAttachment(gif, `${username}Pat.gif`)],
        });
    }

    public async createPatGif(avatarURL: string, { frames = 10, resolution = 64, delay = 25 }: PatOptions = {}): Promise<Buffer> {
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
                .printImage(this.pats[i], 0, 0, resolution, resolution)
                .getImageData().data;

            encoder.addFrame(frame);
        }

        encoder.finish();
        return await buffer(stream);
    }

    public calculateDimensions(i: number, frames: number) {
        const j = i < frames / 2 ? i : frames - i;
        const width = 0.8 + j * 0.02;
        const height = 0.8 - j * 0.05;
        return { width, height, offsetX: (1 - width) * 0.5 + 0.1, offsetY: (1 - height) - 0.08 }
    }

    public async onLoad() {
        for (let i = 0; i < DEFAULT_OPTIONS.frames; i++) this.pats.push(await loadImage(join(imageFoler, `pat/pet${i}.gif`)))
    }
}