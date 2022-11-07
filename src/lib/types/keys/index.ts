// Imports
import type { ServiceType } from '../enums';

export * from './events';
export * from './utility';
export * from './structures';

export interface IBaseData {
	id: ServiceType;
}

export type Key = string & { _: never };
