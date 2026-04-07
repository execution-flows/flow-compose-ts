// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow with three reverse composing functions", () => {
  it("chains three functions where each depends on the next", () => {
    const composing1Mock = vi.fn();
    const composing2Mock = vi.fn();
    const composing3Mock = vi.fn();

    const composing3Impl = flowFunction((): string => {
      composing3Mock();
      return "Hello world!";
    });

    const composing2Impl = flowFunction(
      ({ composing3 }: { composing3: FlowFunction<string> }): string => {
        composing2Mock();
        return composing3();
      },
    );

    const composing1Impl = flowFunction(
      ({ composing2 }: { composing2: FlowFunction<string> }): void => {
        composing1Mock(composing2());
      },
    );

    const composingThreeFlow = flow(
      { composing3: composing3Impl, composing2: composing2Impl, composing1: composing1Impl },
      flowFunction(({ composing1 }: { composing1: FlowFunction<void> }): void => {
        composing1();
      }),
    );

    composingThreeFlow();
    expect(composing1Mock).toHaveBeenCalledOnce();
    expect(composing1Mock).toHaveBeenCalledWith("Hello world!");
    expect(composing2Mock).toHaveBeenCalledOnce();
    expect(composing3Mock).toHaveBeenCalledOnce();
  });
});
