---
sidebar_position: 6
---

# Dependency management

The Javascript file that you actually deploy to State Backed must be a single, self-contained
ECMAScript Module.

If you choose to build your bundle yourself, you can manage your dependencies however you
like.

If you choose to have `smply` build your bundles, you can choose to use either Deno-style
or Node/NPM-style dependency management.

## Node-style dependency management

Node-style dependency management requires a `package.json` and installing dependencies into a
`node_modules` directory (via `npm install`, `yarn`, or the equivalent).

You can then `import` or `require` your dependencies as you normally would in node. For example,
you could import xstate with either `import { createMachine } from "xstate";` or
`const { createMachine } = require("xstate");` as long as you have an `xstate` dependency in your
`package.json` and the `xstate` module in your `node_modules` directory at build time.

## Deno-style dependency management

Deno was built to avoid having a build step and to embrace web standards.
Deno dependencies are explicit at the import site and require no external package management.

So, when using deno-style dependency management, you can just write your code, skipping
`package.json` and `node_modules`.
Simple state machines are often easily written as a single Deno-style Typescript/Javascript file.

To import xstate from a Deno-style machine defnition, you could write
`import { createMachine } from "npm:xstate@4.33.0";`

At build time, `smply` will download the specified version of the module and include it in your bundle.
