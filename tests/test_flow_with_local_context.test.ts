// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import type { FlowFunction } from "../src";
import { flowFunction } from "../src";
import { describe, it, expect, vi } from "vitest";
import { flow } from "../src";

describe("flow with function composing another function", () => {
    it("runs greet which invokes greeting from the same flow context", () => {
        const greetHelloWorldMock = vi.fn();
        const greetUsingGreetingMock = vi.fn();

        const greetingHelloWorld = flowFunction({}, () => {
            greetHelloWorldMock();
            return "Hello World!";
        });

        const greetUsingGreeting = flowFunction({}, ({ greeting }: { greeting: FlowFunction<string> }) => {
            greetUsingGreetingMock(greeting());
        });

        const flowRunner = flowFunction({ greet: greetUsingGreeting }, ({ greet }: { greet: FlowFunction<void> }) => {
            greet();
        });

        const helloWorld = flow(
            {
                greeting: greetingHelloWorld,
            },
            flowRunner,
        );

        helloWorld();
        expect(greetUsingGreetingMock).toHaveBeenCalledWith("Hello World!");
        expect(greetHelloWorldMock).toHaveBeenCalledOnce();
    });
});
