import type { HolodexChannel, YoutubeSubscription } from '@prisma/client';

export type YoutubeSubscriptionWithChannel = YoutubeSubscription & { channel: HolodexChannel };
