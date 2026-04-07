// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
import type {
  FlowContext,
  FlowFunctionBody,
  FlowFunctionInvoker,
  Runners,
} from "./types";
import { flowFunction } from "./flow-function";

export function flowProperty<R, RunnersMap extends Runners = Runners>(
  functionBody: FlowFunctionBody<R, RunnersMap>,
): FlowFunctionInvoker<R>;
export function flowProperty<R, RunnersMap extends Runners = Runners>(
  functionContext: Partial<FlowContext>,
  functionBody: FlowFunctionBody<R, RunnersMap>,
): FlowFunctionInvoker<R>;
export function flowProperty<R, RunnersMap extends Runners = Runners>(
  functionContextOrBody: Partial<FlowContext> | FlowFunctionBody<R, RunnersMap>,
  maybeFunctionBody?: FlowFunctionBody<R, RunnersMap>,
): FlowFunctionInvoker<R> {
  if (typeof functionContextOrBody === "function") {
    return flowFunction(functionContextOrBody, { cached: true });
  }

  if (typeof maybeFunctionBody !== "function") {
    throw new Error("flowProperty requires a function body");
  }

  return flowFunction(functionContextOrBody, maybeFunctionBody, { cached: true });
}
