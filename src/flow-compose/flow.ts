// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
import type {
  ArgsFromMarkers,
  FlowContext,
  FlowContextHasArgument,
  FlowFunctionInvoker,
  Runners,
} from "./types";
import { FLOW_ARGUMENT_DEFAULT, isFlowArgument } from "./flow-argument";
import { brandComposedFlow, isComposedFlow, type ComposedFlowLike } from "./flow-composed";
import { isCachedRunner, markCachedRunner } from "./cached";

export { flowArgument } from "./flow-argument";

export type Flow<R, Input = void> = (input: Input) => R;

export function Flow<F extends ComposedFlowLike>(composedFlow: F, options?: { cached?: boolean }): F {
  if (options?.cached) {
    const argCache = new Map<string, unknown>();

    const cached = (...args: unknown[]): unknown => {
      const key = args.length === 0 ? "" : JSON.stringify(args);
      if (argCache.has(key)) return argCache.get(key);
      const result = (composedFlow as unknown as (...a: unknown[]) => unknown)(...args);
      argCache.set(key, result);
      return result;
    };

    brandComposedFlow(cached as (...args: never[]) => unknown);
    markCachedRunner(cached, () => { argCache.clear(); });

    return cached as unknown as F;
  }
  return composedFlow;
}

function wireContextRunner(
  flowRunners: Runners,
  name: string,
  entry: NonNullable<Partial<FlowContext>[string]>,
) {
  if (isComposedFlow(entry)) {
    flowRunners[name] = entry;
    return;
  }
  flowRunners[name] = (entry as FlowFunctionInvoker<unknown>)(flowRunners);
}

function contextHasFlowArgument(flowContext: Partial<FlowContext>): boolean {
  for (const entry of Object.values(flowContext)) {
    if (entry !== undefined && isFlowArgument(entry)) {
      return true;
    }
  }
  return false;
}

function resetCachedRunners(runners: Runners): void {
  for (const runner of Object.values(runners)) {
    if (isCachedRunner(runner)) {
      runner.resetCache();
    }
  }
}

export function flow<R>(
  flowBody: FlowFunctionInvoker<R>,
): () => R;
export function flow<R, const C extends Partial<FlowContext> = Partial<FlowContext>>(
  flowContext: C,
  flowBody: FlowFunctionInvoker<R>,
): FlowContextHasArgument<C> extends true
  ? (args: ArgsFromMarkers<C>) => R
  : () => R;
export function flow<R, const C extends Partial<FlowContext> = Partial<FlowContext>>(
  flowContextOrBody: C | FlowFunctionInvoker<R>,
  flowBody?: FlowFunctionInvoker<R>,
): (() => R) | ((args: ArgsFromMarkers<C>) => R) {
  const flowContext = (flowBody ? flowContextOrBody : {}) as C;
  const actualFlowBody = (flowBody ?? flowContextOrBody) as FlowFunctionInvoker<R>;

  if (!contextHasFlowArgument(flowContext)) {
    const flowRunners: Runners = {};
    Object.entries(flowContext).forEach(([flowFunctionName, entry]) => {
      if (entry === undefined) {
        return;
      }
      wireContextRunner(flowRunners, flowFunctionName, entry);
    });

    const bodyRunner = actualFlowBody(flowRunners);

    const hasCached = Object.values(flowRunners).some(isCachedRunner);
    if (hasCached) {
      const wrapped = (): R => {
        resetCachedRunners(flowRunners);
        return bodyRunner();
      };
      return brandComposedFlow(wrapped) as () => R;
    }

    return brandComposedFlow(bodyRunner) as () => R;
  }

  return brandComposedFlow((args: ArgsFromMarkers<C>) => {
    const flowRunners: Runners = {};
    Object.entries(flowContext).forEach(([name, entry]) => {
      if (entry === undefined) {
        return;
      }
      if (isFlowArgument(entry)) {
        const marker = entry;
        flowRunners[name] = () => {
          const bag = args as Record<string, unknown>;
          if (marker.defaultValue === FLOW_ARGUMENT_DEFAULT) {
            return bag[name];
          }
          return Object.prototype.hasOwnProperty.call(bag, name)
            ? bag[name]
            : marker.defaultValue;
        };
      }
    });
    Object.entries(flowContext).forEach(([name, entry]) => {
      if (entry === undefined) {
        return;
      }
      if (isFlowArgument(entry)) {
        return;
      }
      wireContextRunner(flowRunners, name, entry);
    });

    resetCachedRunners(flowRunners);

    return actualFlowBody(flowRunners)();
  }) as (args: ArgsFromMarkers<C>) => R;
}
