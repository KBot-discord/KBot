import { OptionalAction, RequiredAction } from '#rpc/types';
import { isNullish } from '@sapphire/utilities';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { RequiredBool, RequiredString, OptionalString, OptionalInt32 } from '#rpc/types';

export function fromRequired(value: RequiredBool | undefined): boolean | undefined;
export function fromRequired(value: RequiredString | undefined): string | undefined;
export function fromRequired(value: RequiredBool | RequiredString | undefined): boolean | string | undefined {
	if (isNullish(value)) return undefined;
	return value.data.case === 'value' //
		? value.data.value
		: undefined;
}

export function fromOptional(value: OptionalString | undefined): string | undefined | null;
export function fromOptional(value: OptionalInt32 | undefined): number | undefined | null;
export function fromOptional(value: OptionalString | OptionalInt32 | undefined): string | number | undefined | null {
	if (isNullish(value)) return undefined;
	return value.data.case === 'value' //
		? value.data.value
		: value.data.value === OptionalAction.DELETE
		? null
		: undefined;
}

export function toRequired(value: boolean | undefined): PartialMessage<RequiredBool>;
export function toRequired(value: boolean | undefined): PartialMessage<RequiredBool> {
	return value === undefined //
		? { data: { case: 'action', value: RequiredAction.NOTHING } }
		: { data: { case: 'value', value } };
}

export function toOptional(value: string | undefined | null): PartialMessage<OptionalString>;
export function toOptional(value: string | undefined | null): PartialMessage<OptionalString> {
	return value === undefined
		? { data: { case: 'action', value: OptionalAction.NOTHING } }
		: value === null
		? { data: { case: 'action', value: OptionalAction.DELETE } }
		: { data: { case: 'value', value } };
}
