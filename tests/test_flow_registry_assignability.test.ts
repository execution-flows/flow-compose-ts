// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { ArgsFromMarkers, Flow, InferFlowArgs } from "../src";
import { describe, it, expect } from "vitest";
import { flow, flowArgument } from "../src";

const greetContext = {
  name: flowArgument<string>(),
} as const;

describe("flow() plain callable assignability", () => {
  it("assigns to Record<string, Flow<R, ArgsFromMarkers<C>>> without cast", () => {
    const greetFlow = flow(
      greetContext,
      () => () => "Hello",
    );
    type GreetArgs = ArgsFromMarkers<typeof greetContext>;
    type GreetRegistry = Record<"greet", Flow<string, GreetArgs>>;
    const registry: GreetRegistry = { greet: greetFlow };
    expect(registry.greet({ name: "Ada" })).toBe("Hello");
  });

  it("assigns nullary flow to Record<string, () => R> without cast", () => {
    const nullary = flow(() => () => 7);
    type SevenRegistry = Record<"seven", () => number>;
    const registry: SevenRegistry = { seven: nullary };
    expect(registry.seven()).toBe(7);
  });

  it("assigns async flow to ExpectedCallable when args match ArgsFromMarkers (no cast)", async () => {
    type Item = {
      id: number;
      name: string;
    };
    const processItemContext = {
      item: flowArgument<Item>(),
      requestId: flowArgument<Promise<string>>(),
      onProgress: flowArgument<((stepId: string) => Promise<void>) | undefined>(),
    } as const;
    const processItemFlow = flow(processItemContext, () => async () => {
      await Promise.resolve();
    });
    type ExpectedArgs = ArgsFromMarkers<typeof processItemContext>;
    type ExpectedCallable = (args: ExpectedArgs) => Promise<void>;
    const registry: Record<"process_item", ExpectedCallable> = {
      process_item: processItemFlow,
    };
    await registry.process_item({
      item: { id: 1, name: "x" },
      requestId: Promise.resolve("rid"),
      onProgress: async (stepId: string) => {
        await Promise.resolve(stepId);
      },
    });
  });

  it("InferFlowArgs matches flowArgument default optional shape (EOPT)", () => {
    const ctx = {
      name: flowArgument("guest"),
    } as const;
    const f = flow(ctx, () => () => "ok");
    type Args = InferFlowArgs<typeof ctx>;
    type FRegistry = Record<"f", Flow<string, Args>>;
    const registry: FRegistry = { f };
    expect(registry.f({})).toBe("ok");
    expect(registry.f({ name: "Ada" })).toBe("ok");
  });
});
