// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

describe("flow with flowArgument default", () => {
  it("uses declared default when the argument key is omitted", () => {
    const greetWithNameMock = vi.fn();

    const greetWithName = flowFunction(({ name }: { name: FlowFunction<string> }) => {
      greetWithNameMock(name());
    });

    const flowRunner = flowFunction(({ greet }: { greet: FlowFunction<void> }) => {
      greet();
    });

    const hello = flow(
      {
        name: flowArgument("guest"),
        greet: greetWithName,
      },
      flowRunner,
    );

    hello({});
    expect(greetWithNameMock).toHaveBeenCalledWith("guest");

    greetWithNameMock.mockClear();
    hello({ name: "override" });
    expect(greetWithNameMock).toHaveBeenCalledWith("override");
  });

  it("compile-time: flowArgument with default makes the key optional on the args object", () => {
    function typeChecks() {
      const greetWithName = flowFunction(({ name }: { name: FlowFunction<string> }) => {
        name();
      });
      const flowRunner = flowFunction(({ greet }: { greet: FlowFunction<void> }) => {
        greet();
      });
      const hello = flow(
        {
          name: flowArgument("guest"),
          greet: greetWithName,
        },
        flowRunner,
      );

      hello({});
      hello({ name: "override" });

      // @ts-expect-error wrong type for name when provided
      hello({ name: 123 });
    }

    void typeChecks;
  });
});
