---
sidebar_position: 2
---

# Machine versions

Each [machine definition](./machines) may have many **machine versions** associated with it.

The most important aspect of a machine version is your actual [code](#code-structure) for your authorizer and state machines.

Machine versions can also provide a `version specifier` to help you link
a version to your own systems. We recommend a semantic version, timestamp,
or git commit sha for a version specifier.

You won't be able to create an **[instance](./machine-instances)** of a
machine until you create at least one version for it.

## Code structure

Your code will run in a **web standards-like environment**.
The code that is uploaded to State Backed must be a **self-contained javascript
bundle (no external dependencies) in [ECMAScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#exporting_module_features)
format** and it must export 3 things:
1. Your code should **default export** an [XState machine](https://xstate.js.org/docs/guides/machines.html), (e.g. `export default createMachine({...})`)
2. Your code should export an **`allowRead`** function that will be called to 
authorize all requests to read the state of an instance of your machine
3. Your code should export an **`allowWrite`** function that will be called to 
authorize all requests to send events to an instance of your machine

## Version upgrades

Right now, instances are locked to the machine version they were created from.
Check back soon for an announcement about version upgrades for running instances.

## Builds

The `smply` CLI can attempt to build a suitable State Backed bundle for you
from your javascript or typescript code or you can build your bundle yourself.

If you choose to build your own bundle, make sure you target a web 
standards-like environment and emit an ECMAScript module (esm).

If you elect to have `smply` build your bundle, it executes builds with
[esbuild](https://esbuild.github.io/) using:

```bash
esbuild <your-file.(js|ts)> \
    --bundle \
    --platform=browser \
    --define:process.env.NODE_ENV=\"production\" \
    --format=esm
```

For convenience, `smply` supports node or deno dependency resolution.

Node dependency resolution requires a `package.json` and running `npm install`
prior to building and will take dependencies from the `node_modules` folder.

Deno dependency resolution allows for a fully self-contained machine definition,
without managing a `package.json` or running `npm` but requires that any
dependencies are imported with [Deno-style ESM specifiers](https://deno.land/manual@v1.15.2/linking_to_external_code). You can
`import { createMachine } from "npm:xstate";`
to access XState.

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
    --file <./dist/your-bundle.js>
```

### Listing the versions for a machine

```bash
smply machine-versions list --machine <your machine name>
```
