// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow with nullary function", () => {
  it("calls the flow function", () => {
    const mock = vi.fn();

    const greetHelloWorld = flowFunction({}, () => {
      mock();
    });

    const helloWorld = flow(
      { greet: greetHelloWorld },
      flowFunction({}, ({ greet }: { greet: FlowFunction<void> }) => {
        greet();
      }),
    );

    helloWorld();
    expect(mock).toHaveBeenCalledOnce();
  });

  it("calls the flow function without context", () => {
    const mock = vi.fn();

    const greetHelloWorld = flowFunction(() => {
      mock();
    });

    const helloWorld = flow(
      { greet: greetHelloWorld },
      flowFunction(({ greet }: { greet: FlowFunction<void> }) => {
        greet();
      }),
    );

    helloWorld();
    expect(mock).toHaveBeenCalledOnce();
  });

});
