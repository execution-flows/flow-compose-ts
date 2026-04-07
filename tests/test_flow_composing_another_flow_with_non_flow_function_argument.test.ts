// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect } from "vitest";
import { flow, flowArgument, type Flow } from "../src";

type Callback = () => string;
type ChildArgs = { callback: Callback };

describe("flow composing another flow with non-flow function argument", () => {
  it("accepts plain function value via flow argument", () => {
    const inner = flow(
      { callback: flowArgument<Callback>() },
      flowFunction(({ callback }: { callback: FlowFunction<Callback> }): string => callback()()),
    );

    const outer = flow(
      { child: inner },
      flowFunction(
        ({ child }: { child: Flow<string, ChildArgs> }): string =>
          child({ callback: () => "plain function value" }),
      ),
    );

    expect(outer()).toBe("plain function value");
  });
});
