---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Migrations

Every [machine instance](./machine-instances) has a current [version](./machine-versions).
However, you may publish new machine versions at any time.
Migrations allow you to migrate existing instances between machine versions.

By default, once a machine instance is launched, it will continue to run using the same
machine version that it was launched with.

If you want an instance to run with a newer version of your machine, you'll need to do 2 things:
1. Create a migration or set of migrations such that there's some path from the instance's version to the desired version.
2. Update the instance's desired version.

## Code structure

Your code will run in a [**web standards-like environment**](../runtime-environment).
The code that is uploaded to State Backed must be a **self-contained javascript
bundle (no external dependencies) in [ECMAScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#exporting_module_features)
format** and it must export 2 things:
1. Your code should export an **`upgradeState`** function that will be called to 
upgrade leaf states from one version to the next. By "leaf state", we mean that
this function will be invoked for each individual state below a parallel state.
2. Your code should export an **`upgradeContext`** function that will be called to 
upgrade machine instance context from one version to the next.

### Example

First, you'll write a migration from one version of your machine to another.

<Tabs>
<TabItem value="ts" label="Typescript">

```javascript title=example-migration.ts
import { UpgradeState, UpgradeContext } from "@statebacked/machine-def";

export const upgradeState: UpgradeState = (oldState, oldContext) => {
    // oldState is an array describing a full path to a state in the old version of the machine
    // e.g. ["authenticationPage", "login"] if login is a child state of authenticationPage.
    // oldContext is the most recent context of the machine. It *may not* be a valid context in
    // the given state because upgradeState will be called to migrate history states in
    // addition to current states.

    // a simple renaming of a parent state from "authenticationPage" to "newAuthenticationPage".
    return oldState[0] === "authenticationPage" ? ["newAuthenticationPage"].concat(oldState.slice(1)) : oldState;
};

export const upgradeContext: UpgradeContext = (oldStates, newStates, oldContext) => {
    // oldStates is an array of state paths from the old version of the machine.
    // (e.g. [["a", "b"], ["a", "c"]] if "a" is a parallel state and is in both "b" and "c").
    // newStates is an array of state paths from the new version of the machine.
    // oldContext is the context associated with oldStates in the old version of the machine.

    return {
        ...oldContext,
        upgradeCount: oldContext.upgradeCount + 1
    };
};
```

</TabItem>
<TabItem value="js" label="Javascript">

```javascript title=example-migration.js
export const upgradeState = (oldState, oldContext) => {
    // oldState is an array describing a full path to a state in the old version of the machine
    // e.g. ["authenticationPage", "login"] if login is a child state of authenticationPage.
    // oldContext is the most recent context of the machine. It *may not* be a valid context in
    // the given state because upgradeState will be called to migrate history states in
    // addition to current states.

    // a simple renaming of a parent state from "authenticationPage" to "newAuthenticationPage".
    return oldState[0] === "authenticationPage" ? ["newAuthenticationPage"].concat(oldState.slice(1)) : oldState;
};

export const upgradeContext = (oldStates, newStates, oldContext) => {
    // oldStates is an array of state paths from the old version of the machine.
    // (e.g. [["a", "b"], ["a", "c"]] if "a" is a parallel state and is in both "b" and "c").
    // newStates is an array of state paths from the new version of the machine.
    // oldContext is the context associated with oldStates in the old version of the machine.

    return {
        ...oldContext,
        upgradeCount: oldContext.upgradeCount + 1
    };
};
```

</TabItem>
</Tabs>

Next, we'll register our migration with State Backed:

```bash
smply migrations create --machine <your-machine> --node ./example-migration.ts --from ver_<from-version> --to ver_<to-version>
```

And, finally, we'll set the desired version for our instances:

```bash
smply instances set-desired-version --machine <your-machine> --instance <your-instance> --version ver_<to-version>
```

## CLI

### Creating a migration

Given a machine named `your-machine` and migration code in `migration.ts` that migrates from `from-version` to `to-version`,
where both versions are version IDs returned from `smply machine-versions list --machine <your-machine>`, execute: 

```bash
smply migrations create --machine <your-machine> --node ./migration.ts --from ver_<from-version> --to ver_<to-version>
```

### Upgrading an instance

Setting the desired version for an instance does not immediately upgrade it.
Instead, State Backed will wait until the next event that is delivered to the instance when it is in a [settled](../settling) state.
Then, it will perform the upgrade and deliver the event using the new, upgraded version.
Upgrades are recorded by transitions from a "statebacked.upgrade" event.

:::info
Note: you do not need a migration that directly translates from your current instance version to the desired version.
State Backed will traverse all migrations to attempt to find a path from the current version to the desired version.
This means that you could, for example, provide a migration from/to every new version that you create to ensure that
you can always upgrade/downgrade between all versions.
:::

```bash
smply instances set-desired-version --machine <your-machine> --instance <your-instance> --version ver_<to-version>
```
