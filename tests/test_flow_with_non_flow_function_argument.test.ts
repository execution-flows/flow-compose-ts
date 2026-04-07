// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

describe("flow with non-flow function argument", () => {
  it("plain value flowArgument is accessible from a flow function via runners", () => {
    const greetHelloWorldMock = vi.fn();

    const greetHelloWorld = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greetHelloWorldMock(greeting());
      },
    );

    const helloWorld = flow(
      {
        greeting: flowArgument<string>(),
        greet: greetHelloWorld,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld({ greeting: "Hello, World!" });
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock).toHaveBeenCalledWith("Hello, World!");
  });
});
