// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow with cached flow function", () => {
  it("caches the result of a nullary flow function across calls within the same invocation", () => {
    const greetHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn<(greeting: string) => void>();
    let generatedGreetingIndex = 0;

    const greetingHelloWorld = flowFunction((): string => {
      greetHelloWorldMock();
      generatedGreetingIndex += 1;
      return `Hello World #${String(generatedGreetingIndex)}`;
    }, { cached: true });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        const greetingOnce = greeting();
        const greetingTwice = greeting();
        expect(greetingOnce).toBe(greetingTwice);
        greetUsingGreetingMock(greetingOnce);
      },
    );

    const helloWorld = flow(
      { greeting: greetingHelloWorld, greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld();
    const firstInvocationGreeting = greetUsingGreetingMock.mock.calls[0]?.[0];
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(firstInvocationGreeting).toBe("Hello World #1");
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();

    greetUsingGreetingMock.mockReset();
    greetHelloWorldMock.mockReset();

    helloWorld();
    const secondInvocationGreeting = greetUsingGreetingMock.mock.calls[0]?.[0];
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(secondInvocationGreeting).toBe("Hello World #2");
    expect(secondInvocationGreeting).not.toBe(firstInvocationGreeting);
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();
  });
});
