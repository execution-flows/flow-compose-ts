// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
const COMPOSED_FLOW = Symbol.for("@execution-flows/flow-compose/composedFlow");

export type BrandedComposedFlow = {
  readonly [COMPOSED_FLOW]: true;
};

/** Structural callable shape for nested `flow()` results in context maps (no compile-time brand). */
export type ComposedFlowLike = (...args: never[]) => unknown;

/** Composed flow value after runtime branding; used by `isComposedFlow` narrowing. */
export type ComposedFlowCallable = BrandedComposedFlow & ComposedFlowLike;

export function brandComposedFlow<F extends (...args: never[]) => unknown>(fn: F): F & BrandedComposedFlow {
  Object.defineProperty(fn, COMPOSED_FLOW, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: true,
  });
  return fn as F & BrandedComposedFlow;
}

export function isComposedFlow(value: unknown): value is ComposedFlowCallable {
  return (
    typeof value === "function" &&
    (value as ComposedFlowCallable)[COMPOSED_FLOW]
  );
}
