---
sidebar_position: 8
---

# Keys

**[Authorization](./authorization)** of requests relies on claims about the requester included
in a JWT. Those JWTs must be signed by an appropriate State Backed key.

:::danger
NEVER expose your secret key (`sbsec_...`).
You MUST ONLY generate tokens on your server.
Anyone with your secret key can make any request impersonating any of your users.
:::

Unlike most APIs, you should *rarely* need to directly use your signing keys with State Backed.
Most use cases should use [token exchange](./token-exchange) or [anonymous sessions](./anonymous-sessions),
where State Backed is responsible for handling all aspects of token creation, including signing
tokens with your keys, on your behalf. Thanks to the power of JWTs, we're able to do this
completely securely, without any sacrifices.

## Organizations

Machines, machine versions, and machine instances belong to exactly one organization.
When you first run the `smply` CLI, you will be prompted to create an organization
unless you are accepting an invitation to an existing organization.
Every key is tied to a single organization and can only make requests to entities
that are owned by that organization.

## Scopes

Every key has a set of scopes that it can access.
Every operation requires that its caller have access to some set of scopes.
If you make a request to an endpoint with a JWT signed by a key that does not have access to
the necessary set of scopes, you will receive an HTTP 403.

There are 3 distinct sets of scopes worth mentioning:
- Scopes that are relevant for typical production usage. You can create a key that has access
  to these scopes by passing `--use production` at the CLI. These scopes are:
    - `events.write` - for sending events to machine instances
    - `state.read` - for reading the state of machine instances
    - `instances.write` - for creating new machine instances.
    - `indexes.read` - for querying machine indexes for matching instances
- Scopes that are relevant for typical continuous integration (CI) usage. You can create a key
  that has access to these scopes by passing `--use ci` at the CLI. These scopes are:
    - `machines.read` - to list and retrieve existing machine definitions
    - `machines.write` - to create new machine definitions
    - `machine-versions.read` - to list and retrieve existing machine definition versions
    - `machine-versions.write` - to create new machine definition versions
- Scopes that are only relevant for administration. It is unlikely that you would ever want
  to create a key with these scopes (instead, you would perform these operations from the
  command line with your administrative access).
    - `org.write` - Update organization information, including billing information
    - `org-keys.write` - Create and delete keys for the organization
    - `org-members.write` - Invite, remove, and change the roles of organization members

## Web dashboard

You can create and delete keys in the [web dashboard](https://www.statebacked.dev/tokens).

## CLI

Generate a key for production

```bash
smply keys create \
    --use production \
    --name "something to help you remember what uses this key"
```

Generate a key for CI

```bash
smply keys create \
    --use ci \
    --name "something to help you remember what uses this key"
```

List keys

```bash
smply keys list
```

Delete a key

```bash
smply keys delete --key 'sbk_...'
```
