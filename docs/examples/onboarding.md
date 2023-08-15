---
sidebar_position: 2
---

# Onboarding

Let's build an onboarding flow for a complex app!

Our app will have a guided onboarding tour to highlight key product features and contextual help
that shouldn't show up during the tour but should otherwise show until the user dismisses it

For extra credit, we'll also let our customer support team reset a user to see the tour or contextual
help again (just because it took < 1 minute to do).

As inspireation for our example, we're going to use [Team Pando](https://www.teampando.com), a collaborative product
definition tool that we built that allows product teams to write natural language product requirements
and turn them into state machines that they can attach important context and designs to.

# Housekeeping

Follow along with the full source code [here](https://github.com/statebacked/examples/tree/main/onboarding).

You can also play with a live version of this example [here](https://examples-onboarding.vercel.app/).

Here's a quick video showing the onboarding flow in Team Pando. This is what we'll be replicating.

<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/eh9hrTRpSq4"
    title="State Backed onboarding flow example"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen />

# Why is this hard?

Onboarding and contextual help touch so many areas of an app. You can either add a lot of endpoints to centralize onboarding
state in one place, add logic throughout your backend to collect what you need, or go with a client-side-only local storage
approach.

State Backed removes all of the difficulty of setting up your event collection and state handling *and* makes sure
that your logic is easy to understand for engineers and non-engineers, easy to change, and easy to get **right**.

# Let's get into the implementation

## Let's start with the backend.

Our onboarding flow really has 3 high-level states: onboarding, showing contextual help, and regular usage.

Within the onboarding flow, there are the obvious onboarding steps and, within the contextual help state,
there are parallel states for each help box we might show.

From the regular usage state, we allow support agents to return users to earlier states.

### First, let's visually build out our business logic

We'll use the [Stately Editor](https://stately.ai) to build our business logic but you could also build your logic
as an XState machine directly in code/text.

<iframe
    width="100%"
    height="750px"
    src="https://stately.ai/registry/editor/embed/0885219e-36eb-4df0-938d-0ba06f338c2f?machineId=baf70852-5205-431f-b545-7e76b8d78a54" />

### Then, we'll copy the code 

The code in our [`onboarding.ts`](https://github.com/statebacked/examples/blob/main/onboarding/statebacked/src/machines/onboarding.ts)
file is exported directly from the Stately registry and pasted into the file.

### We'll define two simple authorization functions

You can see the `allowRead` and `allowWrite` functions that we defined [here](https://github.com/statebacked/examples/blob/main/onboarding/statebacked/src/index.ts#L11).

Basically, we ensure that users can read state only from their own instances and
that users can send events only to their own instances.
We also allow any user with an `isCustomerSupport` claim in their authorization context to send events that start with "Customer support:".

### We're now done with our backend

That's it. The fastest path from business logic to production.

### Types

We do like our types :) so we'll generate types for our state machine and use them later in our frontend.

To generate types, just run `npm run typegen` in the example.
This is just running `xstate typegen ./src/machines/*.ts` internally to generate typegen files for each
state machine like [this](https://github.com/statebacked/examples/blob/main/onboarding/statebacked/src/machines/onboarding.typegen.ts).

We take advantage of these types in our [UI](https://github.com/statebacked/examples/blob/main/onboarding/ui/src/Example.tsx#L44)
to create a fully type-safe actor that can send exactly the events we defined, auto-completes state, and ensures that we access
only items that actually exist in context.

## Token exchange

We'll set up a trusted Supabase identity provider and a token provider so that we can [exchange](../concepts/token-exchange) our
Supabase authentication tokens for State Backed tokens securely.

**This allows us to have 0 backend code** and a fully static website.

```
# install the State Backed CLI
npm install --global smply

# generate a State Backed key
smply keys create --use production --name onboarding-example

# Create an identity provider
smply identity-providers upsert-supabase --project <project-id> --secret <jwt-secret> --mapping '{"sub.$": "$.sub"}'

# Create a token provider
smply token-providers upsert --key sbk_<key-id-from-above> --service example-onboarding --mapping '{"sub.$": "$.sub"}'
```

## Now, let's check out the UI

Our UI is a stock React app running with Vite that uses Supabase for authentication and creates and sends events to instances
of the State Backed machine we just defined.

### Obtaining a local actor for a remote machine instance

We create a strongly-typed React [hook](https://github.com/statebacked/examples/blob/main/onboarding/ui/src/hooks/useMachine.ts)
to wrap up the creation or retrieval of our machine instances and setting up a local actor to access them (it just calls [`stateBackedClient.machineInstances.getorCreateActor`](https://statebacked.github.io/client-js/classes/StateBackedClient.html#machineInstances)).

This allows us to use **exactly the same XState React hooks** that you would normally use with client-side state machines to interact with our server-side machine instances.

You can see how we use the standard `useActor` hook [here](https://github.com/statebacked/examples/blob/main/onboarding/ui/src/Example.tsx)

### Rendering UI based on machine instance state

[Example.tsx](https://github.com/statebacked/examples/blob/main/onboarding/ui/src/Example.tsx) demonstrates rendering UI
in React based on the state of our instance and sending events in response to user interactions just as you would with any other client-side XState machine.

# We're done!

That's the whole app.

We got to focus *exclusively* on business logic and we got to treat our backend state machines *identically* to a frontend state machine.
