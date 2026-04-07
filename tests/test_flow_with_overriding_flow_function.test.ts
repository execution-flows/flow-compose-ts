// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow with overriding flow function", () => {
  it("body local context overrides flow context while other functions see the original", () => {
    const greetHelloWorldMock = vi.fn();
    const greetHelloWorld2Mock = vi.fn();
    const greetUsingGreetingMock = vi.fn();

    const greetingHelloWorld = flowFunction((): string => {
      greetHelloWorldMock();
      return "Hello World!";
    });

    const greetingHelloWorld2 = flowFunction((): string => {
      greetHelloWorld2Mock();
      return "Hello World2!";
    });

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greetUsingGreetingMock(greeting());
      },
    );

    const helloWorld = flow(
      { greeting: greetingHelloWorld, greet: greetUsingGreeting },
      flowFunction(
        { greeting: greetingHelloWorld2 },
        ({ greet, greeting }: { greet: FlowFunction<void>; greeting: FlowFunction<string> }): void => {
          greet();
          greeting();
        },
      ),
    );

    helloWorld();
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetHelloWorldMock).toHaveBeenCalledOnce();
    expect(greetHelloWorld2Mock).toHaveBeenCalledOnce();
  });
});
