// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow } from "../src";

describe("flow with cached flow function with argument", () => {
  it("caches results by argument when the same args are used", () => {
    const greetHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction((): ((index: number) => string) => {
      return (index: number) => {
        greetHelloWorldMock(index);
        return `Hello World! - ${String(index)}`;
      };
    }, { cached: true });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: (index: number) => string }): void => {
        const greetingOnce = greeting(11);
        const greetingTwice = greeting(11);
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
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World! - 11");
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock).toHaveBeenCalledWith(11);
  });

  it("computes separate results for different arguments", () => {
    const greetHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction((): ((index: number) => string) => {
      return (index: number) => {
        greetHelloWorldMock(index);
        return `Hello World! - ${String(index)}`;
      };
    }, { cached: true });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: (index: number) => string }): void => {
        const greetingOnce = greeting(11);
        const greetingTwice = greeting(13);
        expect(greetingOnce).not.toBe(greetingTwice);
        greetUsingGreetingMock(greetingOnce);
        greetUsingGreetingMock(greetingTwice);
      },
    );

    const helloWorld = flow(
      { greeting: greetingHelloWorld, greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld();
    expect(greetUsingGreetingMock).toHaveBeenCalledTimes(2);
    expect(greetUsingGreetingMock).toHaveBeenNthCalledWith(1, "Hello World! - 11");
    expect(greetUsingGreetingMock).toHaveBeenNthCalledWith(2, "Hello World! - 13");
    expect(greetHelloWorldMock).toHaveBeenCalledTimes(2);
    expect(greetHelloWorldMock).toHaveBeenNthCalledWith(1, 11);
    expect(greetHelloWorldMock).toHaveBeenNthCalledWith(2, 13);
  });
});
