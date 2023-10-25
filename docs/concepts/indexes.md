---
sidebar_position: 5
---

# Indexes

Machine instances have one primary identifier: their name.
This name is specified at instance creation time and cannot be changed.
You can always look up an instance by its name to get its current state, send it events, etc.

Often, you can name your instances using a scheme that allows you to identify exactly the instance you want without any lookups.
For example, a machine that handles data for a single user could be named with the ID of that user.

However, it's sometimes useful to be able to find machine instances based on other attributes of the instance, some of which may change over time (e.g. find a machine based on the document owner or the folder the document is in).
This is the purpose of **indexes**.

Every machine may specify an unlimited number of named indexes.
Each machine version specifies a mapping from the index name to the property within each machine instance's context that should be used as the value for that index.

For example, imagine a machine that represents a document in a folder structure.
Machine instances may have a context shape like `{ "folder": "/clients/my-client/sales-pitches" }`.
The machine can specify an index named `folder` and a machine version could provide `indexSelectors` like `{ "folder": "$.folder" }`.
Note how the `indexSelectors` map index names to JSONPath expressions that point to the value from each instance's context to use for that index.
Then, we could find all documents in a particular folder by querying the `folder` index with the filter `{ "op": "eq", "value": "/clients/my-client/sales-pitches" }`.

For now, index selectors must point to strings or arrays of strings.
If the selector points to a string, that will be the value indexed for the instance.
If the selector points to an array of strings, each string in the array will be independently indexed for that instance.

Because machines are [restricted](../limits) to 400kb of context data, indexes provide us a means of storing an unbounded amount of data about a single entity (e.g. there is no limit on the number of documents in a folder in the above example).

:::caution
Without indexes, only those elements of an instance's context that are under the `public` key are exposed outside of the instance.
With indexes, the value of any indexed context property, which is not limited only to those properties under the `public` key, are exposed to any client with permission to query from the index.
Index queries are allowed from any client with `indexes.read` scope.
:::

## Guarantees

Indexes may be updated in an eventually-consistent manner if their values change due to a transition.
We ensure that index updates will occur within a few seconds of the transition (they currently happen transactionally with the transition).
Obviously, transitions may occur which, depending on your transition logic, may update the indexed value between querying an index and making another call to read the data from the machine.
Each query to an index, however, will retrieve a consistent page of items.

## CLI

### Creating a machine with indexes

```bash
# to create a machine definition without an initial version but with indexes
smply machines create \
  --machine <your-machine-name> \
  --index <my-index> \
  --index <my-index2>

# to create a machine definition with an initial version and indexes
smply machines create \
  --machine <your-machine-name> \
  --node <your-machine.(ts|js)> \
  --index-selectors '{ "my-index": "$.jsonPath.inContext", "my-index2": "$.jsonPath.inContext" }'
```

### Creating a machine version with index selectors

```bash
smply machine-versions create \
  --machine <your-machine-name> \
  --node <your-machine.(ts|js)> \
  --version-reference 0.1.0 \
  --index-selectors '{"idx1": "$.idx1", "idx2": "$.idx2"}' \
  --make-current
```

### Creating a machine version, reusing the index selectors from the current version

```bash
smply machine-versions create \
  --machine <your-machine-name> \
  --node <your-machine.(ts|js)> \
  --version-reference 0.1.0 \
  --make-current
  # --index-selectors defaults to the current version's index-selectors
```

### Querying for instances that match a filter

```bash
smply instances query \
  --machine <your-machine-name> \
  --index <your-index-name> \
  --op eq \
  --value "some-value" \
  --sort asc
  # supported ops: eq, ne, gt, gte, lt, lte
```

## Client SDK

[Documentation](https://statebacked.github.io/client-js/classes/StateBackedClient.html#machineInstances)

```javascript
import { StateBackedClient } from "@statebacked/client";

const client = new StateBackedClient({
  anonymous: {
    orgId: "org_your-org-id",
  }
});

// highlight-start
const { instances, cursor } = await client.machinesInstances.query(
  "your-machine-name",
  "your-index-name",
  {
    op: "eq", // support eq, ne, gt, gte, lt, lte
    value: "your-filter-value",
    limit: 5, // number of items to return
    dir: "asc", // asc or desc
  }
);

// use cursor to retrieve the next page of results
// highlight-end
```
