// Imports
import type { IBaseData } from './index';

export interface IKaraokeData extends IBaseData {
	method: KaraokeMethods;
}

export interface IKaraokeMenuCustomId {
	eventId: string;
}