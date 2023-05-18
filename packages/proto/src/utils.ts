import { OptionalAction, RequiredAction } from './gen/types/crud/v1/crud_pb';
import type { OptionalInt32, OptionalString, RequiredBool, RequiredString } from './gen/types/crud/v1/crud_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export function fromRequired(value: RequiredBool | undefined): boolean | undefined;
export function fromRequired(value: RequiredString | undefined): string | undefined;
export function fromRequired(value: RequiredBool | RequiredString | undefined): boolean | string | undefined {
	if (value === undefined) return undefined;
	return value.data.case === 'value' //
		? value.data.value
		: undefined;
}

export function fromOptional(value: OptionalString | undefined): string | null | undefined;
export function fromOptional(value: OptionalInt32 | undefined): number | null | undefined;
export function fromOptional(value: OptionalInt32 | OptionalString | undefined): number | string | null | undefined {
	if (value === undefined) return undefined;
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

export function toOptional(value: string | null | undefined): PartialMessage<OptionalString>;
export function toOptional(value: string | null | undefined): PartialMessage<OptionalString> {
	return value === undefined
		? { data: { case: 'action', value: OptionalAction.NOTHING } }
		: value === null
		? { data: { case: 'action', value: OptionalAction.DELETE } }
		: { data: { case: 'value', value } };
}
