// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect } from "vitest";
import { flow, flowArgument, type Flow } from "../src";

type GreetArgs = { name: string };

describe("flow composing another flow with flow argument", () => {
  it("parent can call inner flow that expects flowArgument args", () => {
    const inner = flow(
      { name: flowArgument<string>() },
      flowFunction(({ name }: { name: FlowFunction<string> }) => `Hello, ${name()}`),
    );

    const outer = flow(
      { greet: inner },
      flowFunction(
        ({ greet }: { greet: Flow<string, GreetArgs> }) => greet({ name: "Ada" }),
      ),
    );

    expect(outer()).toBe("Hello, Ada");
  });
});
