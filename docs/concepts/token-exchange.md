---
sidebar_position: 8
---

# Token exchange

[Authorization](./authorization) of requests relies on claims about the requester included
in a JWT. Those JWTs must be signed by an appropriate State Backed [key](./keys).

You can never expose your State Backed secret keys. Traditionally, that would mean that you
would need a small server-side endpoint that would generate and sign a State Backed JWT
based on whatever authentication mechanism you already use (e.g. the JWT you use to authorize other requests).

**But...we can do better than that!**

State Backed is a backend as a service and you will never need to run your own backend to securely deploy
state machines on our platform.

Token exchange is the mechanism that enables that.

## Overview

The high-level idea is that you will configure State Backed to trust your existing identity provider provider,
configure the key and claims you want to use to create State Backed tokens, and then exchange your
identity provider's token for a State Backed token with claims derived from the original token.

## Identity providers

Identity providers handle the authentication of your users. These providers (e.g. Auth0, AWS Cognito,
Supabase, etc.) generally return a JWT to your application that you can use to securely determine
the attributes of the logged-in user.

These identity providers publish keys that allow anyone to verify the authenticity of a token they produce.
The good ones do so using asymmetric keys that allow anyone with the public key to verify but not forge
a token.

A State Backed identity provider configuration consists of a few things:
- The audience and issuer (`aud` and `iss`) that identify tokens produced by this identity provider
- The acceptable signing algorithms for tokens from this identity provider
- The url to a JWKS file or the secret key used to verify tokens from this identity provider
- A mapping that extracts claims from tokens from this identity provider and makes them available for inclusion in State Backed tokens.

State Backed allows you to configure as many trusted identity providers as you'd like.
Whenever State Backed receives a token exchange request, it will identify the identity provider configuration
to use to verify the token by looking at the audience and issuer (`aud` and `iss`) claims in the token
and using the corresponding identity provider configuration (either or `aud` or `iss` may be blank
but not both).

We then verify the signature on the token using the configured signing algorithms and keys and,
if the token is valid, we extract the claims using the provided mapping.

## Token providers

Token providers are specific to State Backed. A token provider is a configuration that determines
how your State Backed token will be created and signed.

You can create multiple token providers for different apps or different use cases and request
tokens from a particular token provider when performing a token exchange.

A token provider configuration consists of:
- A State Backed [key](./keys) to use to sign tokens (this will determine the scopes conferred to the tokens)
- A service name used to identify the token provider during a token exchange
- A mapping that creates the claim set for the generated token from the claims extracted by the identity providers

## Token exchange

State Backed hosts a [standards-compliant](https://datatracker.ietf.org/doc/html/rfc8693) token exchange endpoint
at https://api.statebacked.dev/tokens.

Generally, you won't need to use this endpoint directly because the State Backed client has full support for
token exchange.

You can configure the client like this:

```javascript
import { StateBackedClient } from "@statebacked/client";

const client = new StateBackedClient({
  identityProviderToken() {
    return yourIdentityProvider.getToken();
  },
  orgId: "org_YOUR-STATE-BACKED-ORG", // get this from smply orgs list
  tokenProviderService: "example-onboarding", // service for your token provider
});

// now you can make requests using the client and not have to worry about token exchange
// or token refresh if your token expires
```

## Mappings

Mappings are JSON objects that declaratively map from one JSON structure to another.

Mappings treat any object keys that do not end in ".$" as literals and copies the data from them
exactly (other than any descendant objects that *do* have ".$" keys - those are treated as dynamic references).

The values of any object keys that *do* end in ".$" are treated as JSON Path expressions that index into the source
object for the mapping.

So, given a source object like `{ "sub": "abc", "auth": { "roles": ["role-1", "role-2"] } }`, this mapping:

```javascript
{
  "sub.$": "$.sub",
  "authInfo": {
    "source": "my-provider",
    "roles": "$.auth.roles"
  }
}
```

would produce this result:

```javascript
{
  "sub": "abc",
  "authInfo": {
    "source": "my-provider",
    "roles": ["role-1", "role-2"]
  }
}
```

### Mapping composition

Identity provider mappings use the claim set of the provided token as their input and map to an intermediate claims object.
Then, token provider mappings take that intermediate claims object as input and map to the final set of claims that will be included in the State Backed token.

## Web dashboard

Manage identity providers and token providers in the [web dashboard](https://www.statebacked.dev/tokens).

## CLI

Configure an identity provider with a JWKS url

```bash
smply identity-providers upsert \
  --audience your-audience \
  --issuer your-issuer \
  --algorithm RS256 --algorithm RS384 \
  --jwks-url https://youridentityprovider.com/.well-known/jwks.json \
  --mapping '{"sub.$": "$.sub"}'
```

Configure an identity provider with a secret key

```bash
smply identity-providers upsert \
  --audience your-audience \
  --issuer your-issuer \
  --algorithm HS256 --algorithm HS384 \
  --key signing-key \
  --mapping '{"sub.$": "$.sub"}'
```

Configure an Auth0 identity provider

```bash
smply identity-providers upsert-auth0 \
  --domain https://your-auth0-domain.us.auth0.com \
  --mapping '{"sub.$": "$.sub"}'
```

Configure an AWS Cognito identity provider

```bash
smply identity-providers upsert-auth0 \
  --user-pool-id your-user-pool-id \
  --region us-east-1 \
  --mapping '{"sub.$": "$.sub"}'
```

Configure a token provider

```bash
smply token-providers upsert \
    --service your-service-name \
    --key sbk_your-state-backed-key-id \
    --mapping '{"sub.$": "$.sub"}'
```