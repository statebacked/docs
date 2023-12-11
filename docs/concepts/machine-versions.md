---
sidebar_position: 2
---
import TogglerExample from "@site/src/components/Examples/toggler-machine-example";

# Machine versions

Each [machine definition](./machines) may have many **machine versions** associated with it.

The most important aspect of a machine version is your actual [code](#code-structure) for your [authorizer](./authorization) and state machines.

Machine versions can also provide a `version specifier` to help you link
a version to your own systems. We recommend a semantic version, timestamp,
or git commit sha for a version specifier.

You won't be able to create an **[instance](./machine-instances)** of a
machine until you create at least one version for it.

## Code structure

Your code will run in a [**web standards-like environment**](../runtime-environment).
The code that is uploaded to State Backed must be a **self-contained javascript
bundle (no external dependencies) in [ECMAScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#exporting_module_features)
format** and it must export 3 things:
1. Your code should **default export** an [XState machine](https://xstate.js.org/docs/guides/machines.html), (e.g. `export default createMachine({...})`)
2. Your code should export an **`allowRead`** function that will be called to 
authorize all requests to read the state of an instance of your machine
3. Your code should export an **`allowWrite`** function that will be called to 
authorize all requests to send events to an instance of your machine

### Example

<TogglerExample />

## Version upgrades

Existing instances may be upgraded between machine versions via [migrations](./migrations).
As long as there is a path from the current instance version to the desired instance
version via some set of migrations, once you set a desired version for an instance,
State Backed will execute the sequence of migrations to bring the instance state and context
to that version.

## Builds

The `smply` CLI can attempt to build a suitable State Backed bundle for you
from your javascript or typescript code or you can build your bundle yourself.

If you choose to build your own bundle, make sure you target a web 
standards-like [environment](../runtime-environment) and emit an ECMAScript module (esm).
We also highly recommend treating `xstate` as an externally-loaded dependency, referenced
Deno-style as `npm:xstate`. State Backed internally maps this to the latest 4.x version of
XState to ensure that only one XState dependency is used. If you choose to bundle `xstate`
instead of treating it as an external, you will need to use `spawnEphemeralInstance` from
[`@statebacked/machine`](https://github.com/statebacked/machine) instead of the native
xstate `spawn` to spawn ephemeral
(i.e. non-[persistent](./child-instances-and-inter-instance-communication) instances).

If you elect to have `smply` build your bundle, it ensures xstate is treated as an external
library and executes builds with [esbuild](https://esbuild.github.io/) using (essentially):

```bash
esbuild <your-file.(js|ts)> \
    --bundle \
    --platform=browser \
    --define:process.env.NODE_ENV=\"production\" \
    --format=esm \
    --minify \
    --keep-names \
    --legal-comments=none \
    --drop:debugger \
    --external:npm:xstate \
    --alias:xstate=npm:xstate
```

For convenience, `smply` supports node or deno dependency resolution.

Node dependency resolution requires a `package.json` and running `npm install`
prior to building and will take dependencies from the `node_modules` folder.

Deno dependency resolution allows for a fully self-contained machine definition,
without managing a `package.json` or running `npm` but requires that any
dependencies are imported with [Deno-style ESM specifiers](https://deno.land/manual@v1.15.2/linking_to_external_code). You can
`import { createMachine } from "npm:xstate";`
to access XState.

## Web dashboard

You can view and create machine versions by tapping into a machine in the [web dashboard](https://www.statebacked.dev/machines).

Use our in-browser code editor and visualizer to define and deploy versions.

## CLI

### Creating a machine version

Creating a version by building `your-machine.(ts|js)`
**using node dependency resolution**
(requires a `package.json` and `npm install`)

```bash
smply machine-versions create \
    --machine <your machine name> \
    --version-reference 0.2.1 \
    --node <your-machine.(ts|js)>
```

:::info
Deno-style, self-contained dependency support is coming soon.
:::

Creating a version by building `your-machine.(ts|js)`
**using deno dependency resolution**
(requires using deno-style imports)

```bash
smply machine-versions create \
    --machine <your machine name> \
    --version-reference 0.2.1 \
    --deno <your-machine.(ts|js)>
```

Creating a version by **bundling yourself**

```bash npm2yarn
npm run build
smply machine-versions create \
    --machine <your machine name> \
    --version-reference 0.2.1 \
    --js <./dist/your-bundle.js>
```

### Listing the versions for a machine

```bash
smply machine-versions list --machine <your machine name>
```

## Client SDK

[Documentation](https://statebacked.github.io/client-js/classes/StateBackedClient.html#machineVersions)

### Creating a machine version

You will generally want to use the smply CLI to create machine versions.

```javascript
import { StateBackedClient } from "@statebacked/client";

const client = new StateBackedClient(token);

// highlight-start
await client.machineVersions.create(
    "my-machine",
    {
        makeCurrent: true,
        clientInfo: "v0.1.1",
        code: `
            // JS code for your machine version
        `
    }
)
// highlight-end
```

