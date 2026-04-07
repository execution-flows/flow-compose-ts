// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow, Flow } from "../src";

describe("flow composing another cached flow", () => {
  it("caches the inner composed flow result across calls within the same invocation", () => {
    const greetingHelloWorldMock = vi.fn();
    const helloWorldGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction((): string => {
      greetingHelloWorldMock();
      return "Hello, World!";
    });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greeting();
      },
    );

    const helloWorldGreeting = flow(
      { greeting: greetingHelloWorld },
      flowFunction(({ greeting }: { greeting: FlowFunction<string> }): string => {
        const result = greeting();
        helloWorldGreetingMock(result);
        return result;
      }),
    );

    const helloWorld = flow(
      { greeting: Flow(helloWorldGreeting, { cached: true }), greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
        greet();
      }),
    );

    helloWorld();
    expect(greetingHelloWorldMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledWith("Hello, World!");
  });
});
