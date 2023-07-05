import React from 'react';
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Code from "@theme/CodeBlock";

export default function TogglerMachineExample() {
    return (
        <Tabs>
            <TabItem value="ts" label="Typescript">
                <Code language='typescript' title='example-machine.ts'>
                {`
import {createMachine, assign} from "xstate";
import type {AllowRead, AllowWrite} from "@statebacked/machine-def";

// State Backed will call allowRead to determine whether a request to read
// the state of an instance of this machine will be allowed or not.
// authContext contains claims about your end-user that you include in the
// auth token for the request.
//
// In this case, we allow users to read from any machine instance that
// is named with their user id.
export allowRead: AllowRead = ({machineInstanceName, authContext}) =>
    machineInstanceName === authContext.sub;

// Similarly, State Backed calls allowWrite to determine whether a request
// to send an event to an instance of this machine will be allowed or not.
//
// In this case, we allow users to write to any machine instance that
// is named with their user id.
export allowWrite: AllowWrite = ({machineInstanceName, authContext}) =>
    machineInstanceName === authContext.sub;

type Context = {
    public: {
        toggleCount ?: number;
    }
};

export default createMachine<Context>({
    predictableActionArguments: true,
    initial: "on",
    states: {
        on: {
            on: {
                toggle: {
                    target: "off",
                    actions: assign({
                        // any context under the \`public\` key will be visible to authorized clients
                        public: (ctx) => ({
                            ...ctx.public,
                            toggleCount: (ctx.public?.toggleCount ?? 0) + 1
                        })
                    }),
                },
            },
        },
        off: {
            on: {
                toggle: "on",
            },
        },
    },
});
                    `}
                    </Code>

            </TabItem>
            <TabItem value="js" label="Javascript">
                <Code language='javascript' title='example-machine.js'>
                    {`
import {createMachine} from "xstate";

// State Backed will call allowRead to determine whether a request to read
// the state of an instance of this machine will be allowed or not.
// authContext contains claims about your end-user that you include in the
// auth token for the request.
//
// In this case, we allow users to read from any machine instance that
// is named with their user id.
export allowRead = ({machineInstanceName, authContext}) =>
    machineInstanceName === authContext.sub;

// Similarly, State Backed calls allowWrite to determine whether a request
// to send an event to an instance of this machine will be allowed or not.
//
// In this case, we allow users to write to any machine instance that
// is named with their user id.
export allowWrite = ({machineInstanceName, authContext}) =>
    machineInstanceName === authContext.sub;

export default createMachine({
    predictableActionArguments: true,
    initial: "on",
    states: {
        on: {
            on: {
                toggle: {
                    target: "off",
                    actions: assign({
                        // any context under the \`public\` key will be visible to authorized clients
                        public: (ctx) => ({
                            ...ctx.public,
                            toggleCount: (ctx.public?.toggleCount ?? 0) + 1
                        })
                    }),
                },
            },
        },
        off: {
            on: {
                toggle: "on",
            },
        },
    },
});
                `}
                </Code>

            </TabItem>
        </Tabs>
    )
}