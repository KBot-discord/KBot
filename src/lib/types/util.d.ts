// Types
import type { AllowedImageSize, DynamicImageFormat } from 'discord.js';


export interface ImageOptions {
    dynamicFormat?: boolean,
    defaultFormat?: DynamicImageFormat,
    size?: AllowedImageSize,
}
