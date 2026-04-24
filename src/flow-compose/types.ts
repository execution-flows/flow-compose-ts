// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
import type {
  FlowArgumentMarker,
  FlowArgumentMarkerRequired,
  FlowArgumentMarkerWithDefault,
} from "./flow-argument";
import type { ComposedFlowLike } from "./flow-composed";

export type FlowFunction<R> = (...args: never[]) => R;

export type FlowFunctionBody<R, RunnersMap extends Runners = Runners> = (
    flowFunctions: RunnersMap,
) => R;

export type FlowFunctionInvoker<R> = (runners: Record<string, FlowFunction<unknown>>) => FlowFunction<R>;

export type Runners = Record<string, FlowFunction<unknown>>;

export type FlowContextEntry = FlowFunctionInvoker<unknown> | FlowArgumentMarker | ComposedFlowLike;

export type FlowContext = Partial<Record<string, FlowContextEntry>>;

export type FlowArgumentKeys<C> = {
  [K in keyof C]: C[K] extends FlowArgumentMarker ? K : never;
}[keyof C];

export type FlowArgumentKeysRequired<C> = {
  [K in keyof C]: C[K] extends FlowArgumentMarkerRequired ? K : never;
}[keyof C];

export type FlowArgumentKeysWithDefault<C> = {
  [K in keyof C]: C[K] extends FlowArgumentMarkerWithDefault<unknown> ? K : never;
}[keyof C];

type MarkerValueT<M> = M extends FlowArgumentMarkerRequired<infer T>
  ? T
  : M extends FlowArgumentMarkerWithDefault<infer T>
    ? T
    : never;

export type ArgsFromMarkers<C> = {
  [K in FlowArgumentKeysRequired<C>]: MarkerValueT<C[K]>;
} & {
  [K in FlowArgumentKeysWithDefault<C>]?: MarkerValueT<C[K]>;
};

/** Args object inferred from `flowArgument` markers in a flow context map (alias of {@link ArgsFromMarkers}). */
export type InferFlowArgs<C extends Partial<FlowContext>> = ArgsFromMarkers<C>;

export type FlowContextHasArgument<C> = true extends {
  [K in keyof C]: C[K] extends FlowArgumentMarker ? true : false;
}[keyof C]
  ? true
  : false;
