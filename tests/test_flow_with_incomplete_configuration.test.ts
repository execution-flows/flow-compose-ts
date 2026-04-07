// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow with incomplete configuration", () => {
  it("throws when a required runner is missing from the flow context", () => {
    const greetUsingGreeting = flowFunction(
      ({ greeting }: { greeting: FlowFunction<string> }): void => {
        greeting();
      },
    );

    const helloWorld = flow(
      { greet: greetUsingGreeting },
      flowFunction(({ greet }: { greet: FlowFunction<void> }): void => {
        greet();
      }),
    );

    expect(() => {
      helloWorld();
    }).toThrow();
  });
});
