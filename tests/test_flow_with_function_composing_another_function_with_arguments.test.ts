// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

describe("flow with function composing another function with arguments", () => {
  it("flow argument is shared across composing flow functions", () => {
    const greetHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction(
      ({ index }: { index: FlowFunction<number> }): string => {
        greetHelloWorldMock(index());
        return `Hello World! - ${String(index())}`;
      },
    );

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greetUsingGreetingMock(greeting());
      },
    );

    const helloWorld = flow(
      {
        index: flowArgument<number>(),
        greeting: greetingHelloWorld,
        greet: greetUsingGreeting,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld({ index: 11 });
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World! - 11");
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock).toHaveBeenCalledWith(11);
  });
});
