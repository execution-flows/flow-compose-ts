// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

const FLOW_ARGUMENT = Symbol.for("@execution-flows/flow-compose/flowArgument");

export const FLOW_ARGUMENT_DEFAULT = Symbol.for("@execution-flows/flow-compose/flowArgument.noDefault");

export type FlowArgumentMarkerRequired<T = unknown> = {
  readonly [FLOW_ARGUMENT]: true;
  readonly defaultValue: typeof FLOW_ARGUMENT_DEFAULT;
  readonly __flowArgumentType?: T;
};

export type FlowArgumentMarkerWithDefault<T> = {
  readonly [FLOW_ARGUMENT]: true;
  readonly defaultValue: T;
};

export type FlowArgumentMarker<T = unknown> =
  | FlowArgumentMarkerRequired<T>
  | FlowArgumentMarkerWithDefault<T>;

export function flowArgument<T = unknown>(): FlowArgumentMarkerRequired<T>;
export function flowArgument<T>(defaultValue: T): FlowArgumentMarkerWithDefault<T>;
export function flowArgument<T>(defaultValue?: T): FlowArgumentMarker<T> {
  if (arguments.length === 0) {
    return {
      [FLOW_ARGUMENT]: true,
      defaultValue: FLOW_ARGUMENT_DEFAULT,
    } as FlowArgumentMarkerRequired<T>;
  }
  return {
    [FLOW_ARGUMENT]: true,
    defaultValue: defaultValue as T,
  } as FlowArgumentMarkerWithDefault<T>;
}

export function isFlowArgument(value: unknown): value is FlowArgumentMarker {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as FlowArgumentMarker)[FLOW_ARGUMENT]
  );
}
