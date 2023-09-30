---
sidebar_position: 3
---

# Multiplayer tic tac toe

We didn't set out to build a great game backend. We built State Backed to make it as easy as possible to allow
engineers to focus on their business logic by removing all of the accidental complexity from building a
backend.

Obviously, publishing and subscribing changes is absolutely required to fulfill the functional requirements
of many backend systems. Especially with the State Backed model of long-lived, persistent actors that can
act autonomously from the perspective of any given client (in response to timers, events sent from different systems,
or by reacting to completed internal jobs), we considered the ability of clients to subscribe to state updates
for machine instances to be absolutely critical.

What we didn't realize until later is that this makes State Backed a fast and fun way to build the backends
for real-time multiplayer games!

Here's an example of building a real-time, multiplayer tic tac toe game.

# The code

Check out the full source code [in our example repo](https://github.com/statebacked/examples/tree/main/tic-tac-toe) and
feel free to clone it, make changes, and deploy it yourself (State Backed has a free tier).

More importantly, give yourself and a teammate a 5 minute break by playing with a live tic tac toe game
[here](https://examples-tic-tac-toe.vercel.app/).

# Getting started

Let's switch things up a bit and start by taking a look at our UI.
Our goal with the State Backed client is to make connecting to a remote state machine look almost identical to
connecting to a local XState machine.

## UI

We'll build a vanilla React app for our UI and connect to our State Backed machine by using the regular
XState React hooks. Then, we'll render our UI as a function of the state of our remote machine instance.
The important bits of our UI code live in [TicTacToe.ts](https://github.com/statebacked/examples/blob/main/tic-tac-toe/ui/src/TicTacToe.tsx).

First, we'll create a State Backed client using an anonymous session, like this:
```javascript
import { StateBackedClient } from "@statebacked/client";

const client = new StateBackedClient({
  anonymous: {
    orgId: "org_YOUR-ORG-ID",
    getSessionId() {
      return getUserId();
    },
  },
});
```

This sets up a State Backed client that will use the built-in anonymous session configuration
to retrieve a State Backed authorization token with the given session ID.
If we instead needed to rely on authenticated claims about our users in our
authorization functions for our state machine, we could easily register our identity provider
with State Backed and could configure our client like this:

```javascript

const client = new StateBackedClient({
  async identityProviderToken() {
    // e.g. your Auth0 or Cognito token
    return getIdentityProviderToken();
  },
  orgId: "org_YOUR-ORG-ID",
  tokenProviderService: "configured-token-provider",
});
```

For now, we'll continue with the anonymous configuration.

Next, we'll define some helpful types based on our machine. We use [XState typegen](https://xstate.js.org/docs/guides/typescript.html)
(`npm run xstate typegen <machine>.ts`) to generate exact types for our state machine and rely on them for end-to-end typesafety and autocomplete
between our State Backed backend and our frontend code:
```javascript
import { ContextFrom, StateValueFrom } from "xstate";

// the type for events the machine can receive
type Event = Exclude<
  Parameters<(typeof ticTacToeMachine)["transition"]>[1],
  string
> & { [key: string]: unknown };
// the type for the states our machine can be in
type State = StateValueFrom<typeof ticTacToeMachine>;
// the type of our full machine context
type Context = ContextFrom<typeof ticTacToeMachine>;
// the type of only the context that's publicly visible
type OnlyPublicContext = Context["public"];
```

Now, let's look at our `TicTacToe` component.
This is the component where we create or connect to the machine instance that controls our game.
```javascript
import { useStateBackedMachine } from "@statebacked/react";

export default function TicTacToe() {
  const { gameId } = useParams();
  const { actor } = useStateBackedMachine<Event, State, Context>(
    client,
    {
      machineName: "tic-tac-toe-example",
      instanceName: gameId!,
      getInitialContext() {
        return { player1Id: getUserId() };
      },
    },
  );

  // ...
  // then, if we're the second player, we send an event to join the game.
  actor.send({ type: "join", playerId: getUserId() });
}
```

Here, we get the `gameId` from our URL and use that as the name of our machine instance.
The `useStateBackedMachine` hook will create the machine instance if it doesn't exist (using the 
initial context that we provide) or will connect to the machine if it's already been
created.
`useStateBackedMachine` returns an `Actor` that matches the actors that XState creates from its `useMachine` hook.
That's critical because that means that we can use the exact same `useActor` hook from XState
to subscribe to the state of our remote, State Backed machine instance.
Under the hood, our `useStateBackedMachine` has established an auto-reconnecting WebSocket with the State Backed
backend and subscribed to all state updates for our machine instance.
This means that we'll have all state updates pushed to us within a few milliseconds of being recorded.

In our `Game` component, we use the regular `useActor` hook from XState to subscribe to state updates
and send events.

```javascript
import { useActor } from "@xstate/react";

function Game({
  actor,
  hashedUserId,
}: {
  actor: Actor<Event, State, OnlyPublicContext>;
  hashedUserId: string;
}) {
  // subscribe our component to state updates
  const [state, send] = useActor(actor);

  // check if we're in the playing state
  const arePlaying = state.matches("Playing");
  // or the game over state
  const isGameOver = state.matches("Game over");
  // or the waiting for opponent state
  const waitingForPlayer2 = state.matches("Awaiting player 2");

  // ...
  return (
    <GameBoard state={state} send={send} readonly={isGameOver}>
  )
}
```

And, finally, in our `GameBoard` component, we render our board based on the data in `context.public.board`,
which is maintained by our state machine (see logic below) and we send events as players choose their
moves.

```javascript
function GameBoard({
  state,
  send,
  readonly,
}: {
  state: ActorState<State, OnlyPublicContext>;
  send: (event: Event) => void;
  readonly?: boolean;
}) {
  return (
    <table className={styles.gameBoard}>
      <tbody>
        {state.context.public.board.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx}>
                {cell || readonly ? (
                  <div>{cell}</div>
                ) : (
                  <button
                    onClick={() =>
                      // This looks just like sending to a local state machine but we're actually sending
                      // to our remote state machine. Any transition will be immediately published to
                      // all subscribed clients (i.e. the other player).
                      send({ type: "move", row: rowIdx, column: cellIdx })
                    }
                  >
                    {cell}
                  </button>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

That's all there is to our UI. The only State Backed-specific code that we wrote was creating our `StateBackedClient`
and connecting to our machine instance with `useStateBackedMachine`. Everything else was vanilla React/XState.

## Backend

With State Backed, every backend starts (and ends) by defining our business, err... game, logic.

Because our whole goal with State Backed is to make it as fast as possible to go from logic to production,
we use state machines to represent our high-level logic. State machines then invoke actions and guards
that we write in code. This means that most pieces of code are small and self-contained, making them easily
tested and quick to write, and most high-level logic is easy to visualize and simulate and easy to build
confidence that it's correct.

Here's the high-level logic for our tic tac toe game.
(NB: this isn't some diagram that we whipped up to demonstrate what our logic does. This **is** our logic.
This diagram is *executable*, easy for non-engineers to understand, and easy for everyone to simulate and play with.)

<iframe
    width="100%"
    height="750px"
    src="https://stately.ai/registry/editor/d4fab58d-2748-4950-9a22-b85b34ec27a5?machineId=d4ac7ffc-9aa0-48e2-bc79-fc2c62374b43&mode=Design" />

### Overview

Each player will have a player ID and each machine will have some `context`. Context allows us to store additional data in our machine
beyond just the curent state(s) that it's in. We will store our board, previous winners, and a mapping from players to marks (x or o) in
context. With State Backed, anything that we place under the `public` key in context will be accessible to all clients who have access
to the machine. In our case, every player should be able to see the board, previous winners, etc. but they shouldn't be able to see the
ID of the player they're competing against. It's easy for us to put some data under the `public` key and keep some private to our
backend machine instance.

It's important to keep in mind that every State Backed deployment has 2 (and only 2) pieces: a state machine that represents your main logic and
read and write authorization functions that govern who is allowed to send events to your machine instance and who is allowed to read from your
instance.

There's a bit of an interesting twist to the way we handle authentication. We'll gloss over that for now but come back to explain it
after we cover the main body of the game logic.

### Let's walk through our logic

- We assume that the machine will be created by player 1 and that that player will create the machine with the context `{ player1Id: "..." }`.
  We actually don't just assume that, we **enforce** that in our State Backed authorization logic. Specifically, in our `allowWrite`
  authorizer, we have this [check](https://github.com/statebacked/examples/blob/main/tic-tac-toe/statebacked/src/index.ts#L23):
  ```javascript
  export const allowWrite: AllowWrite<Context, AnonymousAuthContext, Event, State> = (env) => {
    if (env.type === "initialization") {
        return env.authContext.sid === env.context.player1Id;
    }
    // ...
  }
  ```
  This ensures that the machine is initialized with a `context.player1Id` that matches the session ID of the user who's creating the machine (`sid` is provided by the anonymous token provider).
  Remember, every call to State Backed has a set of claims about the user making that call (the `authContext`) that you can rely on to
  make authorization decisions.
- Once the machine is created, we hash the player ID and publish the hash (more on that below) and then we wait for a second player to
  send a `join` event.
- We have an authorization [check](https://github.com/statebacked/examples/blob/main/tic-tac-toe/statebacked/src/index.ts#L23) on the
  `join` event to ensure that the user who sends it passes along their correct player ID:
  ```javascript
  export const allowWrite: AllowWrite<Context, AnonymousAuthContext, Event, State> = (env) => {
    // ...
    if (env.event.type === "join") {
        return env.authContext.sid === env.event.playerId;
    }
    // ...
  }
  ```
- Once the second user joins, we enter the `Playing` state. Within the `Playing` state, we wait for X's move, process it, then wait
  for Y's move, and so on. We obviously want to ensure that players can't move on behalf of their opponents. We have 2 choices to
  prevent that: either we could add a guard to our game logic to only react to moves made by the correct player or we could add
  a check to our authorization logic to outright reject move events sent by the wrong player. Because this felt like more of an
  authorization decision than a game logic decision, we decided to put this check in our
  [authorizer](https://github.com/statebacked/examples/blob/main/tic-tac-toe/statebacked/src/index.ts#L23), like this:
  ```javascript
  export const allowWrite: AllowWrite<Context, AnonymousAuthContext, Event, State> = (env) => {
    // ...
    if (matchesState("Playing", env.state)) {
      // get the "mark" (x or o) for the player who sent the event
      const playerMark = {
        [env.context.player1Id]: env.context.public.player1Mark,
        [env.context.player2Id]: env.context.public.player2Mark,
      }[env.authContext.sid];

      // make sure it's the turn of the player who sent the event
      if (matchesState("Playing.Awaiting x move", env.state)) {
        return playerMark === "x";
      }

      if (matchesState("Playing.Awaiting o move", env.state)) {
        return playerMark === "o";
      }
    }
    // ...
  }
  ```
- In the "processing" states after each move, we check whether the game has been won or come to a draw and, if it has,
  we transition to the `Game over` state. Our logic for determining the status of a game is kept outside
  of our state machine, in a pure function, [here](https://github.com/statebacked/examples/blob/main/tic-tac-toe/statebacked/src/game-logic.ts).
  As much as we love state machines, anything that *can* be written as a pure function, probably *should*
  be written as a pure function.
- From our `Game over` state, either player can choose to start another game, which will clear the board, swap the
  x and y players, and re-enter the `Playing` state.

One important thing to note: like in many apps, authorization is *context-dependent*.
This is an area where we have seen many traditional backends-as-a-service struggle.
You typically get to determine what state is exposed to who and who can update their state but
often need to resort to writing bespoke backend logic to enforce that a certain series of events must take place in order
or to ensure that a specific user can take a specific action *in a specific state*.
With State Backed, this becomes much more natural to express.

# Deployment

Let's look at what it takes to deploy this state machine to the State Backend cloud.

The first time you create the machine definition, you'll run:

```bash
smply machines create \
      --machine tic-tac-toe-example \
      --node ./statebacked/src/index.ts
```

That creates your machine (named `tic-tac-toe-example`) and uploads a new machine version based on the
code in [`index.ts`](https://github.com/statebacked/examples/blob/main/tic-tac-toe/statebacked/src/index.ts),
which exports `allowRead` and `allowWrite`, and default-exports our state machine.

Whenever you want to update your machine definition, you can publish a new version by running:

```bash
smply machine-versions create \
      --machine tic-tac-toe-example \
      --version-reference "$(git rev-parse HEAD)" \
      --node ./statebacked/src/index.ts \
      --make-current
```

This will publish a new version of your machine and, because we specified `--make-current`, it will ensure that any
*new* instances we create will, by default, use this new version of the machine.

## But what if you want to upgrade running instances of your machine?

This is where most services for long-running processes give up.
In fact, we have yet to find another service for long-running processes that allows reasonable upgrades for running instances
(typically, they require a bunch of `if (currentVersion > 12) { ... }` checks to forever live in your code).

And we *completely* understand *why* these other services have made that tradeoff. This is, at best, a hard problem and,
in general, an *impossible* problem to cleanly solve for completely unconstrained user code.

But because state machines provide just enough constraints on user code (namely, that the "state" of a running instance
consists of the machine state + context *only*), we can turn this typically-unpleasant upgrade experience into something
that's actually fairly straightforward.

We didnt' intend to demonstrate migrations with this example but we just so happend to have made a mistake.
[Orignally](https://github.com/statebacked/examples/blob/09de6b8a6f70501c4cf4bdcc1399047b305babc5/tic-tac-toe/machines/src/tic-tac-toe-machine.ts#L65),
we mis-named the "Awaiting o move" state as "Awaiting y move" and mis-named "Process o move" as "Process y move".
Oops!

So we fixed the machine and deployed a new version with `smply machine-versions create`.
Then, we created a [migration](https://github.com/statebacked/examples/blob/main/tic-tac-toe/statebacked/migrations/applied/2023-08-19_ver_BCj-FQxfSPGKwov_tknEIQ_ver_FsrMf_baSJG53SBNSUszzw.ts)
that mapped the incorrect state names to the correct state names like this:

```javascript
import { UpgradeState, UpgradeContext } from "@statebacked/machine";

export const upgradeState: UpgradeState = (oldState, _context) => {
  // I made a silly mistake and originally named the "o" player
  // "y" in the states I defined.
  // Easy to fix with a migration!
  return oldState.map((state) =>
    state === "Awaiting y move"
      ? "Awaiting o move"
      : state === "Process y move"
      ? "Process o move"
      : state
  );
};
```

Then, we uploaded our migration:

```bash
smply migrations create \
      --machine tic-tac-toe-example \
      --from ver_BCj-FQxfSPGKwov_tknEIQ \
      --to ver_FsrMf_baSJG53SBNSUszzw \
      --node ./statebacked/migrations/migration.ts
```

Then, we upgraded our running instance to use our new machine version:

```bash
smply instances set-desired-version \
      --machine tic-tac-toe-example \
      --instance <name-of-instance-to-upgrade> \
      --version ver_FsrMf_baSJG53SBNSUszzw 
```

The next event we sent to the machine used our migration to convert our machine state into a state that's compatible with our
new machine version, stored our updated state and swapped the version to use for that instance, and then processed the
event with the new machine version. From then on, our instance was indistinguishable from one that was originally created from our
current machine version.

<details>

<summary>Well... almost indistinguishable</summary>

We record instance upgrades as transitions so they are visible when you view the transition history of an instance.

Here's an example of this particular instance's history:

```bash
smply instances list-transitions \
      --machine tic-tac-toe-example \
      --instance 46e893ef-b090-4c79-a236-b734d9e2ae26
[
  #...
  # notice that the state is "Awaiting y move". Oops!
  {
    "createdAt": "2023-08-19T16:05:30.532611+00:00",
    "state": {
      "Playing": "Awaiting y move"
    },
    "event": {
      "type": "join",
      "playerId": "56d784f8-498e-4bf0-bc02-8abbf3d8087e"
    }
  },
  # This records our "statebacked.upgrade" event.
  # Notice that the state is now "Playing.Awaiting o move" after processing this "event".
  {
    "createdAt": "2023-08-19T16:08:27.016941+00:00",
    "state": {
      "Playing": {
        "Awaiting o move": {}
      }
    },
    "event": {
      "type": "statebacked.upgrade",
      "migrationPath": [
        "76991086-2a9e-40ff-b74f-82ec3b0df760",
        "2df43789-626f-4110-b11b-5af80ec1dbcf"
      ],
      "toMachineVersionId": "16cacc7f-f6da-4891-b9dd-204d494b33cf",
      "fromMachineVersionId": "f74e9730-709e-4962-95df-7377336d0d7b"
    }
  },
  # From here on, the machine is using our new version and our migrated state.
  {
    "createdAt": "2023-08-19T16:08:27.016941+00:00",
    "state": {
      "Playing": {
        "Awaiting o move": {}
      }
    },
    "event": {
      "type": "join",
      "playerId": "56d784f8-498e-4bf0-bc02-8abbf3d8087e"
    }
  },
  # ...
]
```

</details>

# That's all

Here's what we did:
- Built our game logic in a simple, declarative statechart that was easy to simulate and play with.
- Wrote our simple authorizers.
- Deployed that logic directly to State Backed. No infrastructure wrangling, servers, or even serverless functions to deal with.
- Built a UI in exactly the same way that we would have if we were using a local XState machine but with the automatic benefit of real-time, multiplayer state updates.

# Let us know what you build with our free plan!
