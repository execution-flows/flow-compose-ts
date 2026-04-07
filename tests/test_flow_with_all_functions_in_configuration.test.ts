// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow with all functions in configuration", () => {
  it("all flow functions are explicitly declared in the flow context", () => {
    const greetHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction((): string => {
      greetHelloWorldMock();
      return "Hello World!";
    });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greetUsingGreetingMock(greeting());
      },
    );

    const helloWorld = flow(
      { greeting: greetingHelloWorld, greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld();
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();
  });
});
