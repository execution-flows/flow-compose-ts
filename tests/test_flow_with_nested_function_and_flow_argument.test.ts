// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect } from "vitest";
import { flow, flowArgument } from "@/flow-compose/flow";

describe("flow with nested flowFunction and root flowArgument", () => {
  it("propagates flowArgument runners through nested flowFunction invokers", () => {
    const leaf = flowFunction(({ name }: { name: FlowFunction<string> }) => {
      return `Hello, ${name()}`;
    });

    const middle = flowFunction({ doGreet: leaf }, ({ doGreet }: { doGreet: FlowFunction<string> }) => {
      return doGreet();
    });

    const flowRunner = flowFunction({ greet: middle }, ({ greet }: { greet: FlowFunction<string> }) => {
      return greet();
    });

    const hello = flow(
      {
        name: flowArgument<string>(),
        greet: middle,
      },
      flowRunner,
    );

    expect(hello({ name: "Ada" })).toBe("Hello, Ada");
  });

  it("compile-time: nested composition still enforces flowArgument args", () => {
    function typeChecks() {
      const leaf = flowFunction(({ name }: { name: FlowFunction<string> }) => {
        return `Hello, ${name()}`;
      });
      const middle = flowFunction({ doGreet: leaf }, ({ doGreet }: { doGreet: FlowFunction<string> }) => {
        return doGreet();
      });
      const flowRunner = flowFunction({ greet: middle }, ({ greet }: { greet: FlowFunction<string> }) => {
        return greet();
      });
      const hello = flow(
        {
          name: flowArgument<string>(),
          greet: middle,
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
