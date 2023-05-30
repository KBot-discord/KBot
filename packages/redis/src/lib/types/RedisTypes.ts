/**
 * Special type to make sure Redis keys are purposefully created.
 */
export type Key = string & { _: never };
