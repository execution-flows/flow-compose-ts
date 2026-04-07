// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

const CACHED_RUNNER = Symbol.for("@execution-flows/flow-compose/cachedRunner");

export type CachedRunnerMeta = {
  readonly [CACHED_RUNNER]: true;
  resetCache(): void;
};

export function isCachedRunner(value: unknown): value is CachedRunnerMeta {
  return (
    typeof value === "function" &&
    CACHED_RUNNER in (value as object)
  );
}

export function markCachedRunner(
  fn: object & { resetCache?: () => void },
  resetFn: () => void,
): void {
  Object.defineProperty(fn, CACHED_RUNNER, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: true,
  });
  fn.resetCache = resetFn;
}
