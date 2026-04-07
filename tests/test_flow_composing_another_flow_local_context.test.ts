// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect } from "vitest";
import { flow } from "../src";

describe("flow composing another flow local context", () => {
  it("flowFunction local context accepts a composed flow", () => {
    const inner = flow(
      { dep: flowFunction(() => 41) },
      flowFunction(({ dep }: { dep: FlowFunction<number> }) => dep() + 1),
    );

    const invoker = flowFunction(
      { nested: inner },
      ({ nested }: { nested: FlowFunction<number> }) => nested(),
    );

    const root = flow({}, invoker);
    expect(root()).toBe(42);
  });
});
