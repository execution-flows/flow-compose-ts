// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
import type {
    FlowContext,
    FlowFunction,
    FlowFunctionBody,
    FlowFunctionInvoker,
    Runners
} from "./types";
import { isFlowArgument } from "./flow-argument";
import { isComposedFlow } from "./flow-composed";
import { markCachedRunner } from "./cached";

export type FlowFunctionOptions = {
  cached?: boolean;
};

export function flowFunction<R, RunnersMap extends Runners = Runners>(
    functionBody: FlowFunctionBody<R, RunnersMap>,
    options?: FlowFunctionOptions,
): FlowFunctionInvoker<R>;
export function flowFunction<R, RunnersMap extends Runners = Runners>(
    functionContext: Partial<FlowContext>,
    functionBody: FlowFunctionBody<R, RunnersMap>,
    options?: FlowFunctionOptions,
): FlowFunctionInvoker<R>;
export function flowFunction<R, RunnersMap extends Runners = Runners>(
    functionContextOrBody: Partial<FlowContext> | FlowFunctionBody<R, RunnersMap>,
    functionBodyOrOptions?: FlowFunctionBody<R, RunnersMap> | FlowFunctionOptions,
    maybeOptions?: FlowFunctionOptions,
): FlowFunctionInvoker<R> {
  let functionContext: Partial<FlowContext>;
  let body: FlowFunctionBody<R, RunnersMap>;
  let options: FlowFunctionOptions | undefined;

  if (typeof functionContextOrBody === "function") {
    functionContext = {};
    body = functionContextOrBody;
    if (functionBodyOrOptions !== undefined && typeof functionBodyOrOptions !== "function") {
      options = functionBodyOrOptions;
    }
  } else {
    functionContext = functionContextOrBody;
    if (typeof functionBodyOrOptions !== "function") {
      throw new Error("flowFunction requires a function body");
    }
    body = functionBodyOrOptions;
    options = maybeOptions;
  }

  const isCached = options?.cached === true;

  function invoker(runners: Runners) {
    const flowFunctionRunners: Runners = { ...runners };
    Object.entries(functionContext).forEach(([flowFunctionName, entry]) => {
        if (entry === undefined) {
            return;
        }
        if (isFlowArgument(entry)) {
            return;
        }
        if (isComposedFlow(entry)) {
            flowFunctionRunners[flowFunctionName] = entry;
            return;
        }
        flowFunctionRunners[flowFunctionName] = (entry as FlowFunctionInvoker<unknown>)(flowFunctionRunners);
    });

    if (isCached) {
      let initialized = false;
      let behavior: "value" | "function" = "value";
      let cachedValue: unknown;
      let innerFn: ((...args: unknown[]) => unknown) | undefined;
      let argCache: Map<string, unknown> | undefined;

      const cachedRunner = (...args: unknown[]): unknown => {
        if (!initialized) {
          const result = body(flowFunctionRunners as RunnersMap);
          if (typeof result === "function") {
            behavior = "function";
            innerFn = result as (...args: unknown[]) => unknown;
            argCache = new Map();
          } else {
            behavior = "value";
            cachedValue = result;
          }
          initialized = true;
        }
        if (behavior === "function" && innerFn && argCache) {
          const key = JSON.stringify(args);
          if (argCache.has(key)) return argCache.get(key);
          const value = innerFn(...args);
          argCache.set(key, value);
          return value;
        }
        return cachedValue;
      };

      markCachedRunner(cachedRunner, () => {
        initialized = false;
        behavior = "value";
        cachedValue = undefined;
        innerFn = undefined;
        argCache = undefined;
      });

      return cachedRunner as unknown as FlowFunction<R>;
    }

    function runner(...args: unknown[]) {
      const result = body(flowFunctionRunners as RunnersMap);
      if (typeof result === "function") {
        return (result as (...args: unknown[]) => unknown)(...args);
      }
      return result;
    }
    return runner as unknown as FlowFunction<R>;
  }
  return invoker;
}
