---
sidebar_position: 11
---

# HTTP API

The HTTP API lets you expose your [machine instances](./machine-instances) as standard HTTP endpoints.
Instead of requiring clients to use the State Backed SDK or API directly, you can accept arbitrary HTTP requests, map them to machine events, and return custom HTTP responses — turning any state machine into a web service.

This is useful when you want to:
- Accept webhooks from third-party services
- Provide a custom REST API backed by durable state machines
- Integrate with systems that can only make plain HTTP requests

## How it works

1. You export an `httpApiMapper` from your [machine version](./machine-versions) code alongside your machine definition, `allowRead`, and `allowWrite`.
2. A request arrives at `/http-api/{orgId}/machines/{machineSlug}/{httpApiSlug}`.
3. State Backed calls the `handler` for the matching slug, passing it the raw HTTP request details (body, headers, method, and query parameters).
4. Your handler validates the request, performs any authentication checks, and returns the name of the machine instance to target, the event to send, an `authContext`, and an optional `initialContext`.
5. If the machine instance doesn't exist and you provided `initialContext`, State Backed auto-creates it with the provided `initialContext`. Then, `allowWrite` is called with the `authContext` your handler returned and the event is sent to the instance.
6. The machine processes the event and [settles](../settling).
7. State Backed calls your `responseMapper` with the settled machine state, context, and result.
8. Your `responseMapper` returns the HTTP status code, headers, and body to send back to the caller.

:::info
Your handler is responsible for authenticating the raw HTTP request (e.g. validating a JWT, checking API keys, verifying signatures). The `authContext` it returns is then passed to your `allowWrite` function, just like in a normal State Backed API call. This means both your handler and `allowWrite` participate in authorization — the handler authenticates the HTTP request and constructs the appropriate `authContext`, and `allowWrite` gates event delivery based on it.
:::

## Defining an `httpApiMapper`

Export an `httpApiMapper` from your machine version. The mapper is a record keyed by slug strings. Each slug becomes a separate HTTP endpoint at `/http-api/{orgId}/machines/{machineSlug}/{slug}`.

```javascript
import { createMachine, assign } from "xstate";

function verifyAndDecodeJwt(authHeader) {
  // Verify the JWT and return the decoded payload.
  // Throw if the token is missing, invalid, or expired.
}

export const allowRead = ({ authContext, context }) => {
  return authContext.sub === context.userId;
};

export const allowWrite = ({ authContext, context }) => {
  return authContext.sub === context.userId;
};

export default createMachine({
  id: "order",
  initial: "pending",
  context: {
    items: [],
    total: 0,
    orderId: null,
    userId: null,
  },
  states: {
    pending: {
      on: {
        place: {
          target: "placed",
          actions: assign({
            items: (_, evt) => evt.items,
            total: (_, evt) => evt.total,
          }),
        },
      },
    },
    placed: {
      on: {
        fulfill: "fulfilled",
        cancel: "cancelled",
      },
    },
    fulfilled: {
      type: "final",
      data: (ctx) => ({ orderId: ctx.orderId, total: ctx.total }),
    },
    cancelled: {
      type: "final",
    },
  },
});

// highlight-start
export const httpApiMapper = {
  "place-order": {
    handler: (request) => {
      if (request.method !== "POST") {
        throw new Error("Method not allowed");
      }

      const jwt = verifyAndDecodeJwt(request.headers["authorization"]);

      const { orderId, items, total } = request.body;
      if (!orderId || !items || !total) {
        throw new Error("Missing required fields");
      }

      return {
        machineInstanceName: orderId,
        event: { type: "place", items, total },
        authContext: { sub: jwt.sub },
        initialContext: { items: [], total: 0, orderId, userId: jwt.sub },
      };
    },
    responseMapper: ({ state, context }) => ({
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: {
        orderId: context.orderId,
        status: state,
        total: context.total,
      },
    }),
  },
};
// highlight-end
```

A POST to `/http-api/{orgId}/machines/order/place-order` with a valid JWT will:
1. Validate the method and JWT, extracting the caller's `sub` claim.
2. Create or find the machine instance named by `orderId`.
3. Pass `{ sub: jwt.sub }` as the `authContext` to `allowWrite`, which checks it against the instance's `userId`.
4. Send the `place` event with the order data.
5. Return the settled state as a JSON response.

If the handler throws (e.g. bad method, invalid JWT, missing fields), the request fails before any machine instance is created or event is sent.

### Example request

```bash
curl --request POST \
  https://api.statebacked.dev/http-api/$ORG_ID/machines/order/place-order \
  --header "Authorization: Bearer $JWT" \
  --header "Content-Type: application/json" \
  --data '{
    "orderId": "order-123",
    "items": ["item-a", "item-b"],
    "total": 49.99
  }'
```

## Request flow in detail

### Handler input

Your `handler` function receives an `HttpApiRequest`:

```javascript
{
  body: unknown,           // parsed request body
  headers: Record<string, string>,
  method: string,          // "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"
  query: Record<string, string>,
}
```

### Handler output

Your handler returns an `HttpApiHandlerResponse` telling State Backed which machine instance to target:

```javascript
{
  machineInstanceName: string,  // which instance to send the event to
  event: { type: string },      // the event to send
  authContext: object,          // passed to allowWrite to authorize the event
  initialContext: object,       // optional: create the instance with this context if it doesn't exist
}
```

:::tip
Provide `initialContext` when you want State Backed to auto-create the machine instance if it doesn't already exist. If you omit it and the instance doesn't exist, the request will fail.
:::

### Response mapper input

After the machine [settles](../settling), your `responseMapper` receives:

```javascript
{
  state: string | object,  // the current state value of the machine
  context: object,         // the full machine context
  result: unknown | null,  // the machine's output if it reached a final state, otherwise null
}
```

### Response mapper output

Your `responseMapper` returns the full HTTP response:

```javascript
{
  statusCode: number,
  headers: Record<string, string>,
  body: unknown,
}
```

:::caution
If the `responseMapper` throws an error, State Backed falls back to returning `{ ok: true }` with a 200 status code. Ensure your response mapper handles all possible machine states.
:::

## Multiple endpoints

You can define multiple slugs in your `httpApiMapper`, each becoming a separate endpoint:

```javascript
export const httpApiMapper = {
  "place-order": {
    handler: (request) => { /* ... */ },
    responseMapper: ({ state, context }) => { /* ... */ },
  },
  "cancel-order": {
    handler: (request) => {
      const jwt = verifyAndDecodeJwt(request.headers["authorization"]);

      return {
        machineInstanceName: request.body.orderId,
        event: { type: "cancel" },
        authContext: { sub: jwt.sub },
      };
    },
    responseMapper: ({ state }) => ({
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: { status: state },
    }),
  },
};
```
