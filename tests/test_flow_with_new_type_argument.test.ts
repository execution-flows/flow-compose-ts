// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

type Greeting = string & { readonly __greetingBrand: unique symbol };

describe("flow with new type argument", () => {
  it("accepts a branded type as a flowArgument", () => {
    const helloWorld = flow(
      { greeting: flowArgument<Greeting>() },
      flowFunction(({ greeting }: { greeting: FlowFunction<Greeting> }): void => {
        expect(greeting()).toBeTruthy();
      }),
    );

    helloWorld({ greeting: "Hello, World!" as Greeting });
  });
});
