// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "@/flow-compose/types";
import { flowFunction } from "@/flow-compose/flow-function";
import { describe, it, expect, vi } from "vitest";
import { flow } from "@/flow-compose/flow";

describe("flow composing another flow", () => {
  it("does not run the inner flow while wiring the parent", () => {
    const innerRanMock = vi.fn();

    const inner = flow(
      {
        dep: flowFunction(() => "ok"),
      },
      flowFunction(({ dep }: { dep: FlowFunction<string> }) => {
        innerRanMock();
        return dep();
      }),
    );

    expect(innerRanMock).not.toHaveBeenCalled();

    const outer = flow(
      { child: inner },
      flowFunction(({ child }: { child: FlowFunction<string> }) => child()),
    );

    expect(innerRanMock).not.toHaveBeenCalled();
    expect(outer()).toBe("ok");
    expect(innerRanMock).toHaveBeenCalledOnce();
  });

  it("supports invoking an inner composed flow directly", () => {
    const inner = flow(
      { dep: flowFunction(() => "manual") },
      flowFunction(({ dep }: { dep: FlowFunction<string> }) => dep()),
    );

    const outer = flow(
      { child: inner },
      flowFunction(({ child }: { child: FlowFunction<string> }) => child()),
    );

    expect(outer()).toBe("manual");
  });
});
