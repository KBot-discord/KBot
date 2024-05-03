import type { KaraokeEvent, KaraokeUser } from '@prisma/client';

export type KaraokeEventWithUsers = KaraokeEvent & { queue: KaraokeUser[] };
