---
sidebar_position: 1
---

# Email automation

Let's build a toy app with a full email automation flow to periodically engage users based on their in-app behavior!

Our toy app will allow users to create documents which they can share and publish and create organizations
which they can invite members to and upgrade billing plans for.

We want our email flow to periodically send emails to prompt users to take the next sensible step in their usage
of the product.

# Housekeeping

Follow along with the full source code [here](https://github.com/statebacked/examples/tree/main/email-automation).

You can also play with a live version of this example [here](https://examples-state-backed.vercel.app/).

Check out this quick video walk through or read on for more detils.

<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/F_uazfnwr-A"
    title="State Backed email automation example"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen />

# Why is this hard?

Email automation is difficult because it combines two very different and uniquely challenging paradigms:
1. Event-based, reactive systems to keep track of user state
2. Workflow-oriented systems with long-running, durable timers to reliably execute tasks on a schedule

Typically, you would need to build and scale two completely separate systems to accomodate the very different
engineering realities of these two different paradigms.
Long-running timers are notoriously difficult to manage *reliably* at scale and propogating state updates
from the reactive- to workflow-oriented aspects of the system needs to be carefully coordinated.

Finally, the typical conception of the workflow-oriented part of the system would be to think about
sending emails *in bulk*. This introduces a whole new set of parital failure scenarios to think about,
guard against, and mitigate.

# The approach with State Backed

With State Backed, instead of thinking about a big system that manages state and emails for every user,
you just think about your business logic for a single user, represent it in a state machine that's visualizable,
simulatable, and testable, deploy the machine to State Backed, and then launch an instance for every user.
These independent instances manage their own state. Your code doesn't need to consider persistence or consistency
because the platform ensures event processing order and durability.

# Let's get into the implementation

## Let's start with the backend.

Remember, our backend needs to receive events whenever users perform some action to update their state and needs
some workflow to periodically send out emails based on that state.

### First, let's visually build out our business logic

We'll use the [Stately Editor](https://stately.ai) to build our business logic but you could also build your logic
as an XState machine directly in code/text.

<iframe
    width="100%"
    height="750px"
    src="https://stately.ai/registry/editor/embed/5bd62779-2f23-4d90-bdce-fac723fa13f8?machineId=0281361a-9034-4334-82aa-cbf9cc185b54" />

Here, we have two important, parallel container states: `userState` for maintaining the user state and `emailSender` for
sending emails on a schedule.

We make these parallel states so that both can execute concurrently.

#### Let's look at `userState` first.

`userState` is itself a parallel state because there are multiple, orthogonal concerns that we want to track
for each user.

We have a state to track the actions they've taken related to documents and, within that, states to track
sharing and publishing documents.

We also have a state to track the actions users have taken related to organizations and, within that, states
to track invitations and plan status.

While we often focus on the states once a machine is built, what we really care about while building a
machine--especially a reactive flow--is the events.
The events define our features--the set of things that users can **do** in our app.

Then, we can create states to define two things:
1. *When* are users allowed to do each of those things
2. *What* should happen when a user does one of those things

In this case, the structure of our states ensures that, for example, once a user has shared any document,
we never get confused by future documents being created and send an email that makes us look silly.

#### Now, let's take a look at `emailSender`

We have a simple workflow defined with `after` events, which schedule the sending of the next email
after each successful email send.
That's all that's required to set up long-running, multi-day timers that will reliably deliver events
to your machine instances.

The logic in our [sendEmail](https://github.com/statebacked/examples/blob/main/email-automation/statebacked/src/machines/email-automation.ts#L540)
service, which is invoked by each email sending state inspects the current user state and
chooses the correct email to send based on what the user has actually done in the app.

### Then, we'll copy the code 

The code in our [`email-automation.ts`](https://github.com/statebacked/examples/blob/main/email-automation/statebacked/src/machines/email-automation.ts)
file is exported directly from the Stately registry and pasted into the file.
All we added was implementations for our services.

### We'll define two simple authorization functions

You can see the `allowRead` and `allowWrite` functions that we defined [here](https://github.com/statebacked/examples/blob/main/email-automation/statebacked/src/index.ts#L11).

Basically, we ensure that users can read state only from their own instances and
that users can send events only to their own instances.
We also ensure that instances are created with the email that belongs to the user
who created them.

### We're now done with our backend

No need to evaluate database consistency guarantees and scaling properties, no need to evaluate event buses
and run tests to determine the latency various event processing mechanisms incur in propagating state
updates to our email sending system.

Write your business logic. Visually. Understandably. Everything else just works.

### Types

We do like our types :) so we'll generate types for our state machine and use them later in our frontend.

To generate types, just run `npm run typegen` in the example.
This is just running `xstate typegen ./src/machines/*.ts` internally to generate typegen files for each
state machine like [this](https://github.com/statebacked/examples/blob/main/email-automation/statebacked/src/machines/email-automation.typegen.ts).

## Now, let's check out the UI

Our UI is a NextJS app that uses Supabase for authentication and creates and sends events to instances
of the State Backed machine we just defined.

### Token generation

Our machine needs to ensure that users can only modify their own state.
To do that, we create a JWT, signed by a key that we generate using the State Backed CLI (`smply keys create`).

[Here](https://github.com/statebacked/examples/blob/main/email-automation/ui/app/statebacked-token/route.ts)
is a simple API route that returns a State Backed token (using the [@statebacked/token](https://npmjs.com/package/@statebacked/token)
library) based on the logged-in user's Supabase token. We include the user's ID (`sub`) and email
so that we can use them to authorize requests to our machine instances.

### Creating or retrieving a machine instance

We create a strongly-typed React [hook](https://github.com/statebacked/examples/blob/main/email-automation/ui/components/hooks/useStateBackedMachineInstance.ts)
to wrap up the creation or retrieval of our instances (using [`stateBackedClient.machineInstances.getorCreate`](https://statebacked.github.io/client-js/classes/StateBackedClient.html#machineInstances))
and the type-safe sending of events (using [`stateBackedClient.machineInstances.sendEvent`](https://statebacked.github.io/client-js/classes/StateBackedClient.html#machineInstances)).

### Rendering UI based on machine instance state

[SampleApp.tsx](https://github.com/statebacked/examples/blob/main/email-automation/ui/components/SampleApp.tsx) demonstrates rendering UI
in React based on the state of our instance and sending events in response to user interactions.

# We're done!

That's the whole app.

Our backend *entirely* consists of business logic. We haven't introduced any accidental complexity
or infrastructure concerns.

Normally, we would have had to set up datastores, think through consistency and latency
guarantees, and implement durable timers.

Here, we just wrote the logic that our users actually care about.
