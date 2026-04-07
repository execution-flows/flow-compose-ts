// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow composing another flow and using it in the body", () => {
  it("body directly invokes the composed inner flow runner", () => {
    const greetingHelloWorldMock = vi.fn();
    const helloWorldGreetingMock = vi.fn();
    const helloWorldMock = vi.fn();

    const greetingHelloWorld = flowFunction((): string => {
      greetingHelloWorldMock();
      return "Hello, World!";
    });

    const helloWorldGreeting = flow(
      { greeting: greetingHelloWorld },
      flowFunction(({ greeting }: { greeting: FlowFunction<string> }): string => {
        const result = greeting();
        helloWorldGreetingMock(result);
        return result;
      }),
    );

    const helloWorld = flow(
      { greeting: helloWorldGreeting },
      flowFunction(({ greeting }: { greeting: FlowFunction<string> }): void => {
        helloWorldMock(greeting());
      }),
    );

    helloWorld();
    expect(greetingHelloWorldMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledWith("Hello, World!");
    expect(helloWorldMock).toHaveBeenCalledOnce();
    expect(helloWorldMock).toHaveBeenCalledWith("Hello, World!");
  });
});
