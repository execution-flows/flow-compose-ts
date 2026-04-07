// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "../src";

describe("flow with argument default value overridden by invocation", () => {
  it("caller-supplied value overrides flowArgument default", () => {
    const greetUsingGreetingMock = vi.fn();

    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greetUsingGreetingMock(greeting());
      },
    );

    const helloWorld = flow(
      {
        greeting: flowArgument("Hello World!"),
        greet: greetUsingGreeting,
      },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    helloWorld({ greeting: "Hola, Mundo!" });
    expect(greetUsingGreetingMock).toHaveBeenCalledOnce();
    expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hola, Mundo!");
  });
});
