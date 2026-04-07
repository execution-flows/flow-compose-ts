// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

describe("flow with function composing another function with arguments with default values", () => {
  it("local context defaults override parent runners", () => {
    const greetHelloWorldMock1 = vi.fn();
    const greetHelloWorldMock2 = vi.fn();
    const greetHelloWorldMock2Greeting2 = vi.fn();
    const greetUsingGreetingIndexDefaultMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greeting2Value = flowFunction((): string => "Hello World2!");

    const greetingHelloWorld1 = flowFunction(
      ({ index }: { index: FlowFunction<number> }): string => {
        greetHelloWorldMock1(index());
        return `Hello World! - ${String(index())}`;
      },
    );

    const greetingHelloWorld2 = flowFunction(
      ({ index, greeting2 }: { index: FlowFunction<number>; greeting2: FlowFunction<string> }): string => {
        greetHelloWorldMock2(index());
        greetHelloWorldMock2Greeting2(greeting2());
        return `Hello World! - ${String(index())}`;
      },
    );

    const greetUsingGreeting = flowFunction(
      { greeting: greetingHelloWorld2, indexDefault: flowFunction(() => 13) },
      ({ indexDefault, greeting }: { indexDefault: FlowFunction<number>; greeting: FlowFunction<string> }): void => {
        greetUsingGreetingIndexDefaultMock(indexDefault());
        greetUsingGreetingMock(greeting());
      },
    );

    const helloWorld = flow(
      {
        index: flowArgument<number>(),
        greeting: greetingHelloWorld1,
        greeting2: greeting2Value,
        greet: greetUsingGreeting,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld({ index: 11 });
    expect(greetUsingGreetingIndexDefaultMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingIndexDefaultMock).toHaveBeenCalledWith(13);
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World! - 11");
    expect(greetHelloWorldMock1).not.toHaveBeenCalled();
    expect(greetHelloWorldMock2).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock2).toHaveBeenCalledWith(11);
    expect(greetHelloWorldMock2Greeting2).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock2Greeting2).toHaveBeenCalledWith("Hello World2!");
  });

  it("local context defaults apply when parent has no matching runner", () => {
    const greetHelloWorldMock2 = vi.fn();
    const greetHelloWorldMock2Greeting2 = vi.fn();
    const greetUsingGreetingIndexDefaultMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greeting2Value = flowFunction((): string => "Hello World2!");

    const greetingHelloWorld2 = flowFunction(
      ({ index, greeting2 }: { index: FlowFunction<number>; greeting2: FlowFunction<string> }): string => {
        greetHelloWorldMock2(index());
        greetHelloWorldMock2Greeting2(greeting2());
        return `Hello World! - ${String(index())}`;
      },
    );

    const greetUsingGreeting = flowFunction(
      { greeting: greetingHelloWorld2, indexDefault: flowFunction(() => 13) },
      ({ indexDefault, greeting }: { indexDefault: FlowFunction<number>; greeting: FlowFunction<string> }): void => {
        greetUsingGreetingIndexDefaultMock(indexDefault());
        greetUsingGreetingMock(greeting());
      },
    );

    const helloWorld2 = flow(
      {
        index: flowArgument<number>(),
        greeting2: greeting2Value,
        greet: greetUsingGreeting,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld2({ index: 11 });
    expect(greetHelloWorldMock2).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock2).toHaveBeenCalledWith(11);
    expect(greetHelloWorldMock2Greeting2).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock2Greeting2).toHaveBeenCalledWith("Hello World2!");
    expect(greetUsingGreetingIndexDefaultMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingIndexDefaultMock).toHaveBeenCalledWith(13);
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World! - 11");
  });
});
