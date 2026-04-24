// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
import type {
  FlowContext,
  FlowFunctionBody,
  FlowFunctionInvoker,
  Runners,
} from "./types";
import { flowFunction, type FlowFunctionOptions } from "./flow-function";

export type FlowPropertyOptions = Omit<FlowFunctionOptions, "cached">;

export function flowProperty<R, RunnersMap extends Runners = Runners>(
  functionBody: FlowFunctionBody<R, RunnersMap>,
  options?: FlowPropertyOptions,
): FlowFunctionInvoker<R>;
export function flowProperty<R, RunnersMap extends Runners = Runners>(
  functionContext: Partial<FlowContext>,
  functionBody: FlowFunctionBody<R, RunnersMap>,
  options?: FlowPropertyOptions,
): FlowFunctionInvoker<R>;
export function flowProperty<R, RunnersMap extends Runners = Runners>(
  functionContextOrBody: Partial<FlowContext> | FlowFunctionBody<R, RunnersMap>,
  maybeFunctionBody?: FlowFunctionBody<R, RunnersMap> | FlowPropertyOptions,
  maybeOptions?: FlowPropertyOptions,
): FlowFunctionInvoker<R> {
  if (typeof functionContextOrBody === "function") {
    let propertyOptions: FlowPropertyOptions | undefined;
    if (maybeFunctionBody !== undefined && typeof maybeFunctionBody !== "function") {
      propertyOptions = maybeFunctionBody;
    }
    return flowFunction(functionContextOrBody, { cached: true, ...propertyOptions });
  }

  if (typeof maybeFunctionBody !== "function") {
    throw new Error("flowProperty requires a function body");
  }

  return flowFunction(functionContextOrBody, maybeFunctionBody, {
    cached: true,
    ...(maybeOptions ?? {}),
  });
}
