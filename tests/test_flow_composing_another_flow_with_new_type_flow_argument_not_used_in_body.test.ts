// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument, type Flow } from "../src";

type Index = number & { readonly __indexBrand: unique symbol };
type HelloWorldGreetingArgs = {
  index: number;
};

describe("flow composing another flow with new type flow argument not used in body", () => {
  it("preserves branded/new-type argument through composed flow layers", () => {
    const greetingHelloWorldMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction(({ index }: { index: FlowFunction<Index> }): string => {
      greetingHelloWorldMock();
      return `Hello, World! - ${String(index())}`;
    });

    const greetUsingGreeting = flowFunction(
      ({ greeting, index }: { greeting: Flow<string, HelloWorldGreetingArgs>; index: FlowFunction<Index> }): void => {
        greetUsingGreetingMock(greeting({ index: index() }));
      },
    );

    const helloWorldGreeting = flow(
      {
        index: flowArgument<Index>(),
        greeting: greetingHelloWorld,
      },
      flowFunction(({ greeting }: { greeting: FlowFunction<string> }): string => greeting()),
    );

    const helloWorld = flow(
      {
        index: flowArgument<Index>(),
        greeting: helloWorldGreeting,
        greet: greetUsingGreeting,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld({ index: 11 as Index });
    expect(greetingHelloWorldMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello, World! - 11");
  });
});
