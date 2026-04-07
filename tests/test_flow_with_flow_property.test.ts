// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { describe, expect, it, vi } from "vitest";
import { flow } from "../src";
import { flowFunction } from "../src";
import { flowProperty } from "../src";

describe("flow with flow property", () => {
  it("caches a nullary property result across calls within the same invocation", () => {
    const greetingBuilderMock = vi.fn();
    const greetUsingGreetingMock = vi.fn<(greeting: string) => void>();
    let generatedGreetingIndex = 0;

    const greetingHelloWorld = flowProperty((): string => {
      greetingBuilderMock();
      generatedGreetingIndex += 1;
      return `Hello World #${String(generatedGreetingIndex)}`;
    });

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
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World #1");
    expect(greetingBuilderMock).toHaveBeenCalledOnce();
  });

  it("caches function results by argument when property returns a function", () => {
    const greetingBuilderMock = vi.fn();
    const greetUsingGreetingMock = vi.fn<(greeting: string) => void>();

    const greetingByIndex = flowProperty((): ((index: number) => string) => {
      return (index: number) => {
        greetingBuilderMock(index);
        return `Hello World! - ${String(index)}`;
      };
    });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: (index: number) => string }): void => {
        const greetingOnce = greeting(11);
        const greetingTwice = greeting(11);
        expect(greetingOnce).toBe(greetingTwice);
        greetUsingGreetingMock(greetingOnce);
      },
    );

    const helloWorld = flow(
      { greeting: greetingByIndex, greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld();
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World! - 11");
    expect(greetingBuilderMock).toHaveBeenCalledOnce();
    expect(greetingBuilderMock).toHaveBeenCalledWith(11);
  });
});
