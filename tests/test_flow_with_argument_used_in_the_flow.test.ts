// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

describe("flow with argument used in the flow", () => {
  it("flow body directly consumes a flowArgument runner", () => {
    const greetingMock = vi.fn();

    const helloWorld = flow(
      { greeting: flowArgument<string>() },
      flowFunction(({ greeting }: { greeting: FlowFunction<string> }): void => {
        greetingMock(greeting());
      }),
    );

    helloWorld({ greeting: "Hello World!" });
    expect(greetingMock).toHaveBeenCalledOnce();
    expect(greetingMock).toHaveBeenCalledWith("Hello World!");
  });
});
