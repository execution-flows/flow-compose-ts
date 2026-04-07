// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument, Flow } from "../src";

type Greeting = () => string;
type HelloWorldGreetingArgs = {
  index: number;
  index2?: number;
  greeting?: Greeting;
};
describe("flow composing another flow with non-flow argument default value", () => {
  it("uses inner argument defaults when parent invokes without override", () => {
    const helloWorldGreetingMock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const helloWorldGreeting = flow(
      {
        index: flowArgument(),
        index2: flowArgument(13),
        greeting: flowArgument<Greeting>(() => "Hello, World!"),
      },
      flowFunction(({ index, index2, greeting }: { index: FlowFunction<number>; index2: FlowFunction<number>; greeting: FlowFunction<Greeting> }): string => {
        const result = `${greeting()()} - ${String(index())} - ${String(index2())}`;
        helloWorldGreetingMock(result);
        return result;
      }),
    );

    const greetUsingGreeting = flowFunction(
      ({ greeting } : { greeting: Flow<string, HelloWorldGreetingArgs> }): string => {
        const result = greeting({ index: 11 });
        greetUsingGreetingMock(result);
        return result;
      },
    );

    const helloWorld = flow(
      { greeting: helloWorldGreeting, greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<string> }): string => greet()),
    );

    const result = helloWorld();
    expect(result).toBe("Hello, World! - 11 - 13");
    expect(helloWorldGreetingMock).toHaveBeenCalledOnce();
    expect(helloWorldGreetingMock).toHaveBeenCalledWith("Hello, World! - 11 - 13");
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello, World! - 11 - 13");
  });
});
