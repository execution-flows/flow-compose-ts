// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument, type Flow } from "../src";

type HelloWorldGreetingArgs = { index: number };

describe("flow composing another flow with flow argument not used in body", () => {
  it("flow argument propagates through context without body consumption", () => {
    const greetingHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction(
      ({ index }: { index: FlowFunction<number> }): string => {
        greetingHelloWorldMock();
        return `Hello, World! - ${String(index())}`;
      },
    );

    const greetUsingGreeting = flowFunction(
      ({ greeting, index }: { greeting: Flow<string, HelloWorldGreetingArgs>; index: FlowFunction<number> }): void => {
        greetUsingGreetingMock(greeting({ index: index() }));
      },
    );

    const helloWorldGreeting = flow(
      {
        index: flowArgument<number>(),
        greeting: greetingHelloWorld,
      },
      flowFunction(({ greeting }: { greeting: FlowFunction<string> }): string => greeting()),
    );

    const helloWorld = flow(
      {
        index: flowArgument<number>(),
        greeting: helloWorldGreeting,
        greet: greetUsingGreeting,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld({ index: 11 });
    expect(greetingHelloWorldMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello, World! - 11");
  });
});
