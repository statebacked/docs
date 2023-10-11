---
sidebar_position: 9
---

# Anonymous sessions

Many applications rely on knowing essential facts (claims) about a user like their user ID or email address.
The best way to pass these user claims to State Backed for use in authorization functions is via
[token exchange](./token-exchange), where you can simply provide an authentication token signed by your
identity provider (e.g. Auth0 or Cognito or your own auth solution) and State Backed can verify its
authenticity, extract the key claims, and create a State Backed token with them. This requires
a quick, one-time setup to ensure that State Backed can verify the authentication tokens you provide.

However, if you're building an app that doesn't rely on strong guarantees about who your users are,
we can make things even easier for you by using **anonymous sessions**.

## Claims

Anonymous sessions can't make any claims about the user who's making a request.

Therefore, the [`authContext`](./authorization) your `allowRead` and `allowWrite` functions receive
for an anonymous session is pretty sparse. It contains only the following claims:
- `sid` - the session ID for this client. The storage mechanism you choose will determine when and how this
  ID might change.
- `did` - the device ID for this client. Again, depending on your storage mechanism, this may change
  even if the underlying device does not.
- `auth` - always set to the string "anonymous" for anonymous sessions

## Availability

By default, every organization is configured to allow anonymous access.
This is still safe even if you rely on user claims because your machine authorizers
can simply reject requests that do not contain user claims.

## Client

The State Backed client has special support for anonymous sessions that makes them particularly
easy to use.

To create a client that will use an anonymous session:

```javascript
import { StateBackedClient } from "@statebacked/client";

const stateBackedClient = new StateBackedClient({
    anonymous: {
        orgId: "org_your-org-id",
    }
});
```

By default, the session and device IDs will only last until a page refresh (or process restart).

To ensure that session and device IDs last longer, you can store them in, for example, session and local storage, like this:

```javascript
import { StateBackedClient } from "@statebacked/client";

const stateBackedClient = new StateBackedClient({
    anonymous: {
        orgId: "org_your-org-id",
        getSessionId: () => {
            const sessionId = window.sessionStorage.getItem("sessionId") ?? crypto.randomUUID();
            window.sessionStorage.setItem("sessionId", sessionId);
            return sessionId;
        },
        getDeviceId: () => {
            const deviceId = window.localStorage.getItem("deviceId") ?? crypto.randomUUID();
            window.localStorage.setItem("deviceId", deviceId);
            return deviceId;
        },
    }
});
```

## Authorization

You can allow users to create session-scoped machine instances but ensure they don't access instances that they
don't own by writing machine authorizers like this:

```javascript title=your-machine-definition.ts
import { AllowRead, AllowWrite, AnonymousAuthContext } from "@statebacked/machine";

// shape of your machine's context
type Context = {};

export const allowRead: AllowRead<Context, AuthContext> = ({ machineInstanceName, authContext }) =>
    // users can only access machine instances for their sessions
    authContext.sid === machineInstanceName;

export const allowWrite: AllowWrite = ({ machineInstanceName, authContext }) =>
    // users can only access machine instances for their sessions
    authContext.sid === machineInstanceName;

export default createMachine({...});
```

## Inner workings

None of the information in this section is needed to use anonymous sessions but we thought you might find it interesting.

Anonymous sessions are built very straightforwardly on top of [token exchange](./token-exchange).

We create an identity provider for tokens with an audience and issuer of https://{org_your-org-id}.anonymous.auth.statebacked.dev
that uses the org ID itself as the verification key and has a mapping that extracts the `sid` and `did` claims from the token.

We also create a token provider with service, anonymous-statebacked-dev, that signs State Backed tokens with a
[production use key](./keys), and includes the `sid` and `did` claims.

Finally, on the client, we sign a JWT with the appropriate claims using the org ID as a signing key and provide it
for token exchange just as we would any other identity provider token.

**So, why is this better than just embedding an signing key directly in the client like so many other services do?**

Because this still allows us to trust that anonymous sessions can **only** provide `sid`, `did`, and `auth="anonymous"`
claims to our authContext. That means that we can enable anonymous access in an org without jeapordizing the security
of authenticated users. As long as your authorizers check claims other than `sid` and `did` or verify that `auth !== "anonymous"`,
they can ensure that the request is properly authenticated and the claims are trustworthy.
