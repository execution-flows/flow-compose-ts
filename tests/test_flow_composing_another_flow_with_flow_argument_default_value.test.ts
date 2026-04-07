// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument, type Flow } from "@/flow-compose/flow";

type HelloWorldGreetingArgs = {
  index: number;
  index2?: number;
};

describe("flow composing another flow with flow argument default value", () => {
  it("uses inner flow argument defaults when parent invokes without override", () => {
    const greetingHelloWorldMock = vi.fn();
    const helloWorldGreetingMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction((): string => {
      greetingHelloWorldMock();
      return "Hello, World!";
    });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: Flow<string, HelloWorldGreetingArgs> }): void => {
        greetUsingGreetingMock(greeting({ index: 11 }));
      },
    );

    const helloWorldGreeting = flow(
      {
        index: flowArgument<number>(),
        index2: flowArgument(13),
        greeting: greetingHelloWorld,
      },
      flowFunction(
        ({ index, index2, greeting }: {
          index: FlowFunction<number>;
          index2: FlowFunction<number>;
          greeting: FlowFunction<string>;
        }): string => {
          const result = `${greeting()} - ${String(index())} - ${String(index2())}`;
          helloWorldGreetingMock(result);
          return result;
        },
      ),
    );

    const helloWorld = flow(
      { greeting: helloWorldGreeting, greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld();
    expect(greetingHelloWorldMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledWith("Hello, World! - 11 - 13");
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello, World! - 11 - 13");
  });
});
