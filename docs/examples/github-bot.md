---
sidebar_position: 4
---

# GitHub bot for state machine visualization

We released a GitHub bot to visualize state machines included in pull requests.
You can install it for free [here](https://github.com/marketplace/state-backed-machine-visualizer).
Obviously, we built this bot as a simple state machine, deployed to State Backed.
Check out the open source repo [here](https://github.com/statebacked/github-visualizer-bot).

## Webhook handling

State Backed has experimental support for converting arbitrary webhooks to events sent to particular machine instances that provides the core architecture for our bot (please reach out to [sales@statebacked.dev](mailto:sales@statebacked.dev) if you're interested in trying out State Backed webhook support).
When a webhook is received at in.webhooks.statebacked.dev/{orgId}/{webhookProvider}, we:

1. Validate it based on the `webhookProvider` configuration for the given `orgId`.
2. Extract the entities referred to by the webhook payload based on the `webhookProvider` configuration. For example, a pull request webhook might refer to a repository, a pull request, and a user.
3. Look up the machine definitions configured for the `orgId` for each entity type we extracted.
4. Create an instance of each machine for the entity ID referenced in the webhook if one doesn't yet exist.
5. Send the webhook payload as an event to the machine instance corresponding to each entity ID.

This has turned out to be an incredibly useful way to think about webhooks because, at their core, webhooks are about synchronizing state related to various entities between two systems.
This allows us to very explicitly conduct that synchronization.

## The code

[Here](https://github.com/statebacked/github-visualizer-bot/blob/main/src/machine.ts) is the machine that implements the logic for our GitHub bot.
When a PR is opened or synchronized (updated), we:

1. List the files included in it
2. Process the files one by one, retrieving the new file text, extracting any state machines, and identifying which state machines were created or updated in this PR, generate a visualization of them and upload it to s3, and, finally, post a comment referencing our s3 asset.

Because of State Backed's durability guarantees, we know that every PR will be fully processed, even in the face of failures.

Our [authorization functions](https://github.com/statebacked/github-visualizer-bot/blob/main/src/index.ts) are quite simple:

```javascript
import { AllowRead, AllowWrite } from "@statebacked/machine";
import { prCommentingMachine } from "./machine";

export const allowRead: AllowRead = ({ authContext }) =>
  authContext.sub === "webhook";
export const allowWrite: AllowWrite = ({ authContext }) =>
  authContext.sub === "webhook";

export default prCommentingMachine;
```

We allow our webhook system and only our webhook system to read and write to instances of our machine.
