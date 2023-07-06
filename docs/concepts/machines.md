---
sidebar_position: 1
---

# Machine definitions

We often call machine definitions simply "machines".

Machine definitions name a logical machine.

For example, you might have a machine definition that represents a flow for a user in your app (like the onboarding machine) or a machine definition that represents the state of a user or entity (like a user machine or a machine for a document that might be shared across many users).

We call this a *logical* machine because your actual business logic lives in **[machine versions](./machine-versions)**.

Each machine definition can have multiple machine versions associated with it but it has only one **current version**.

You can create many **machine instances** for each machine definition.
When you create a machine instance, you can specify the machine version you want to use or State Backed will create an instance using the current version for that machine definition at the time that you create the instance.

So machine definitions are really just a name.
To learn how you'll specify your actual business logic, read on about [machine versions](./machine-versions).

## CLI

### Creating a machine definition

:::tip
By passing the `--node` option, `smply` will attempt to build your ts/js into a
single, self-contained javascript bundle suitable for deployment in our
[web standards-like environment](../runtime-environment).
For this to work, you will need to have a `package.json` and run `npm install`.

Alternatively, you will soon be able to use [Deno-style ESM specifiers](https://deno.land/manual@v1.15.2/linking_to_external_code) for imports, skip the `package.json`
and `npm` entirely, and pass the `--deno` option.

Finally, you can run your own build step to produce a single-file bundle for
a [web standards-like environment](../runtime-environment.md) and pass its path to the `--file` option.
:::

```bash
# to create a machine definition without an initial machine version
smply machines create --machine <your machine name>

# to create a machine definition with an initial machine version
smply machines create --machine <your machine name> --node <your-machine.(ts|js)>
```

### Listing machine definitions

```bash
smply machines list
```

### Retrieving information about a machine definition

```bash
smply machines get --machine <your machine name>
```
