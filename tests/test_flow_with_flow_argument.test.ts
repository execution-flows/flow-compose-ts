// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow, flowArgument } from "../src";

describe("flow with flowArgument", () => {
  it("passes argument object properties as callable runners", () => {
    const greetWithNameMock = vi.fn();

    const greetWithName = flowFunction(({ name }: { name: FlowFunction<string> }) => {
      greetWithNameMock(name());
    });

    const flowRunner = flowFunction(({ greet }: { greet: FlowFunction<void> }) => {
      greet();
    });

    const hello = flow(
      {
        name: flowArgument<string>(),
        greet: greetWithName,
      },
      flowRunner,
    );

    hello({ name: "Ada" });
    expect(greetWithNameMock).toHaveBeenCalledWith("Ada");
  });

  it("compile-time: runner args must match flowArgument marker types", () => {
    function typeChecks() {
      const greetWithName = flowFunction(({ name }: { name: FlowFunction<string> }) => {
        name();
      });
      const flowRunner = flowFunction(({ greet }: { greet: FlowFunction<void> }) => {
        greet();
      });
      const hello = flow(
        {
          name: flowArgument<string>(),
          greet: greetWithName,
        },
        flowRunner,
      );

      hello({ name: "ok" });

      // @ts-expect-error flowArgument<string> requires name to be a string, not a number
      hello({ name: 123 });

      // @ts-expect-error ArgsFromMarkers requires every declared flowArgument key
      hello({});

      // @ts-expect-error object literal may only specify known properties (name)
      hello({ name: "ok", notDeclared: true });
    }

    void typeChecks;
  });
});
