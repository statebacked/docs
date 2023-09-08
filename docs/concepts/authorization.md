---
sidebar_position: 5
---

# Authorization

Each [machine version](./machine-versions) exports `allowRead` and `allowWrite`
functions that are called to authorize reads and writes (sending events),
respectively.

## Authorization model

1. Every request to State Backed includes a JWT signed by one of your [API keys](./keys).
   Thanks to [token exchange](./token-exchange), you generally don't ever actually need
   to create your own JWT. Just use the built-in [anonymous sessions](./anonymous-sessions) or exchange the authentication
   token from your identity provider (e.g. Auth0 or AWS Cognito) for a State Backed token
   with a simple client config.
2. The `act` claim from the JWT contains claims about your end-user and is sent to your `allowRead`
   and `allowWrite` functions as `authContext`. For example, if your JWT included
   `{ act: { sub: "my-user" }}`, Your auhthorizers would be able to rely on `authContext.sub`
   containing the user ID for the request.

If you do choose to create your own JWTs, **on a server you control**, you use the
[@statebacked/token](https://www.npmjs.com/package/@statebacked/token)
library or another JWT library to create a JWT with an `act` claim
that contains claims about your end-user, signed with one of your
State Backed API keys.

### Benefits

This scheme means that you don't need to use State Backed to manage your
users or authentication but State Backed can still securely rely on the
claims you provide about your end users to allow your code to easily make
authorization decisions.

## Authorization functions

The code in every [machine version](./machine-versions) default exports
an XState machine and exports two named functions:
[`allowRead`](https://statebacked.github.io/machine-def/types/AllowRead.html)
and
[`allowWrite`](https://statebacked.github.io/machine-def/types/AllowWrite.html).

Both functions return a boolean indicating whether the request should be allowed or not.
Any request that is denied by an authorization function will respond with a HTTP 403
with a JSON body of `{ "code": "rejected-by-machine-authorizer" }`.

`allowRead` and `allowWrite` both receive a single object with the following properties:
- `machineInstanceName` - the name of the machine instance for which the authorization
  decision is being made
- `state` - The state of the machine instance for which the authorization decision is
  being made. For write requests authorizing the initialization of a machine instance,
  this is `undefined`.
  State is a string for simple, top-level states or an object for hierarchical states.
- `context` - The current context of the machine instance for which the authorization
  decision is being made. For machine instance initialization, this is the initial
  context provided by the caller.
- `authContext` - The authorization context from the JWT provided with the request.
  This is the data provided in the `act` claim in the JWT and represents your app's
  claims about the user making the request. Typically, `authContext.sub` would be
  the user id for the user making the request.

`allowWrite` provides one additional property in its argument if the request is for sending
an event (vs initialization):
- `event` - The event in the request.
  To get the event name, you can check `event.type`.
  If you send an event like `{ "type": "foo", "bar": 4 }` you will have an `event` like this:
  ```javascript
  {
    "type": "foo",
    "bar": 4
  }
  ```

## Examples of authorization schemes

### Machine instance per user

In a machine instance per user authorization model, you can name machine instances with the
ID of the user they are for, include only a `sub` claim in your token, and ensure that
the `machineInstanceName` matches the `authContext.sub` in your authorizers.

Typically, you would just use [token exchange](./token-exchange) to retrieve a State Backed
token with a `sub` claim derived from your identity provider's user ID.

If you want to do your own token generation or understand exactly what the State Backed token would
look like, here you go:

```javascript title=your-serverside-code.ts
import { signToken } from "@statebacked/token";

function generateToken(user) {
    return signToken(
        {
            stateBackedKeyId: process.env.STATE_BACKED_KEY_ID,
            stateBackedSecretKey: process.env.STATE_BACKED_SECRET_KEY,
        },
        {
            sub: user.id
        },
        {
            issuer: "your-domain.com",
            expires: { in: "7d" }
        }
    );
}
```

Regardless of how you generate a token with a `sub` claim, authorization looks the same:

```javascript title=your-machine-definition.ts
import { AllowRead, AllowWrite } from "@statebacked/machine-def";

export const allowRead: AllowRead = ({ machineInstanceName, authContext }) =>
    machineInstanceName === authContext.sub;

export const allowWrite: AllowWrite = ({ machineInstanceName, authContext }) =>
    machineInstanceName === authContext.sub;

export default createMachine({...});
```

### Machine instance per group

In a machine instance per group authorization model, you can name machine instances with
the ID of the group they are for, include a `sub` claim and a `groups` claim
in your token, and ensure that the `machineInstanceName` is included in
`authContext.groups` in your authorizers.

Token generation:

```javascript title=your-serverside-code.ts
import { signToken } from "@statebacked/token";

function generateToken(user) {
    return signToken(
        {
            stateBackedKeyId: process.env.STATE_BACKED_KEY_ID,
            stateBackedSecretKey: process.env.STATE_BACKED_SECRET_KEY,
        },
        {
            sub: user.id,
            groups: user.groups, // array of groups the user is a member of
        },
        {
            issuer: "your-domain.com",
            expires: { in: "7d" }
        }
    );
}
```

Authorization:

```javascript title=your-machine-definition.ts
import { AllowRead, AllowWrite } from "@statebacked/machine-def";

export const allowRead: AllowRead = ({ machineInstanceName, authContext }) =>
    authContext.groups.includes(machineInstanceName);

export const allowWrite: AllowWrite = ({ machineInstanceName, authContext }) =>
    authContext.groups.includes(machineInstanceName);

export default createMachine({...});
```

### Machine instance per group where the machine instance manages group membership

In a machine instance per group authorization model where the machine instance is
itself responsible for determining group membership, you can name machine instances
randomly (e.g. use a UUID), include a `sub` claim in your token,
maintain a `members` map in your machine context mapping user ids to roles,
and ensure that the `authContext.sub` is included in `context.members`
with the appropriate role for the given event in your authorizers.

Note that, as written, this implies creating machine instances with an initial context
that appropriately sets the creator as a member with the admin role.

Token generation:

```javascript title=your-serverside-code.ts
import { signToken } from "@statebacked/token";

function generateToken(user) {
    return signToken(
        {
            stateBackedKeyId: process.env.STATE_BACKED_KEY_ID,
            stateBackedSecretKey: process.env.STATE_BACKED_SECRET_KEY,
        },
        {
            sub: user.id,
        },
        {
            issuer: "your-domain.com",
            expires: { in: "7d" }
        }
    );
}
```

Authorization:

```javascript title=your-machine-definition.ts
import { AllowRead, AllowWrite } from "@statebacked/machine-def";

export const allowRead: AllowRead = ({ context, authContext }) =>
    Object.hasOwn(context.members, authContext.sub);

const membershipUpdateEvents = new Set([
    "add-member",
    "remove-member",
    "update-member-role",
]);

export const allowWrite: AllowWrite = ({ context, event, authContext }) =>
    membershipUpdateEvents.has(event.type)
        // only admins can update membership
        ? context.members[authContext.sub] === "admin"
        // but other roles can send other events
        : Object.hasOwn(context.members, authContext.sub);

export default createMachine({...});
```

## Impersonation

Any State Backed user with sufficient privileges to create a new [API key](./keys)
is able to impersonate any user by creating a JWT with the appropriate claims and
signing it with the key.

This is true of every authorization scheme for every service.
Please remember to protect your keys.

However, it is sometimes critical to examine or modify production data. For that
purpose, any user with permissions that would allow them to create an API key and
impersonate users is allowed to directly access machine instances on a user's
behalf.

In the CLI, this option is provided for creating instances and sending events to
machine instances.

In `smply machine-instances send-event`, or `smply machine-instances create`,
pass `--auth-context '{"sub": "...", ...}'` to supply an auth context to use for
the request.
