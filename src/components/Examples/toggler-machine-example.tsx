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
import type {AllowRead, AllowWrite, AnonymousAuthContext} from "@statebacked/machine-def";

// shape of your machine's context
type Context = {};

// State Backed will call allowRead to determine whether a request to read
// the state of an instance of this machine will be allowed or not.
// authContext contains claims about your end-user that you include in the
// auth token for the request.
//
// In this case, we use anonymous sessions and allow users to read from any
// machine instance that is named with their session id.
export const allowRead: AllowRead<Context, AnonymousAuthContext> = ({machineInstanceName, authContext}) =>
  machineInstanceName === authContext.sid;

// Similarly, State Backed calls allowWrite to determine whether a request
// to send an event to an instance of this machine will be allowed or not.
//
// In this case, we allow users to write to any machine instance that
// is named with their session id.
export const allowWrite: AllowWrite<Context, AnonymousAuthContext> = ({machineInstanceName, authContext}) =>
  machineInstanceName === authContext.sid;

type Context = {
  public: {
    toggleCount ?: number;
  }
};

// this is just a regular XState state machine
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
export const allowRead = ({machineInstanceName, authContext}) =>
  machineInstanceName === authContext.sid;

// Similarly, State Backed calls allowWrite to determine whether a request
// to send an event to an instance of this machine will be allowed or not.
//
// In this case, we allow users to write to any machine instance that
// is named with their user id.
export const allowWrite = ({machineInstanceName, authContext}) =>
  machineInstanceName === authContext.sid;

// this is just a regular XState state machine
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
              toggleCount: (ctx.public.toggleCount || 0) + 1
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