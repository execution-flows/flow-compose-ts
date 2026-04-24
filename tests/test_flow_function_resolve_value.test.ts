// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { describe, expect, it, vi } from "vitest";
import { flow } from "../src";
import { flowFunction } from "../src";
import { flowProperty } from "../src";

type MapNumToNum = (n: number) => number;

type CachedMapperCtx = { mapper: FlowFunction<MapNumToNum> };

type GreetCtx = { greet: FlowFunction<void> };

describe("flowFunction and flowProperty with resolve: \"value\"", () => {
  it("caches a function value as data when cached and resolve is value", () => {
    const bodySpy = vi.fn((): MapNumToNum => {
      const inner = vi.fn((n: number) => n * 2);
      return inner;
    });

    const mapperStep = flowFunction(bodySpy, { cached: true, resolve: "value" });

    const useMapper = flowFunction(
      ({ mapper }: CachedMapperCtx): void => {
        const f1 = mapper();
        const f2 = mapper();
        expect(f1).toBe(f2);
        expect(f1(5)).toBe(10);
        expect(f1(3)).toBe(6);
      },
    );

    const composed = flow(
      { mapper: mapperStep, greet: useMapper },
      flowFunction(({ greet }: GreetCtx): void => {
        greet();
      }),
    );

    composed();
    expect(bodySpy).toHaveBeenCalledOnce();
  });

  it("re-runs the body on each consumer call when not cached and resolve is value", () => {
    const bodySpy = vi.fn((): MapNumToNum => {
      return (n: number) => n + 1;
    });

    const mapperStep = flowFunction(bodySpy, { resolve: "value" });

    const useMapper = flowFunction(
      ({ mapper }: CachedMapperCtx): void => {
        const f1 = mapper();
        const f2 = mapper();
        expect(f1).not.toBe(f2);
        expect(f1(1)).toBe(2);
        expect(f2(1)).toBe(2);
      },
    );

    const composed = flow(
      { mapper: mapperStep, greet: useMapper },
      flowFunction(({ greet }: GreetCtx): void => {
        greet();
      }),
    );

    composed();
    expect(bodySpy).toHaveBeenCalledTimes(2);
  });

  it("flowProperty forwards resolve value for cached function-as-data", () => {
    const bodySpy = vi.fn((): MapNumToNum => {
      const inner = vi.fn((n: number) => n * 3);
      return inner;
    });

    const mapperStep = flowProperty(bodySpy, { resolve: "value" });

    const useMapper = flowFunction(
      ({ mapper }: CachedMapperCtx): void => {
        const f1 = mapper();
        const f2 = mapper();
        expect(f1).toBe(f2);
        expect(f1(2)).toBe(6);
      },
    );

    const composed = flow(
      { mapper: mapperStep, greet: useMapper },
      flowFunction(({ greet }: GreetCtx): void => {
        greet();
      }),
    );

    composed();
    expect(bodySpy).toHaveBeenCalledOnce();
  });
});
