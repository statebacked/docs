---
sidebar_position: 8
---

# Limits

- Machine instances execute in a [web standards-like environment](./runtime-environment) with 128mb of memory.
- When a machine receives an event, it has 10 seconds to ["settle"](./settling), where "settling" means
  that it has no ephemeral child services running.
  If a machine exceeds this 90 second timeout and made at least one successful transition,
  State Backed will respond with the latest machine state.
  In all cases, after the 90 second timeout, any running ephemeral child services will be stopped.
  When **the next** event is sent to the machine instance, State Backed will first deliver
  error events for each ephemeral child service that was active during the timeout and will
  then deliver the new event.
- Context and event data must be JSON-serializable and deserializable. Keep in mind that
  `JSON.parse(JSON.stringify({ something: new Date() }))` does not behave as you hope it does.
  It's best to only put pure data in context.
- Context may never exceed 400kb when represented as JSON in UTF8. If context exceeds
  this size, the transition will fail and the request that delivered the event that caused
  context to exceed that size will fail. The state of the machine instance will be as though
  the failing event never occurred. Because of our [consistency guarantees](./consistency-guarantees),
  no observable actions or services that would have been run due to the failed transition will run.
- The size of the Javascript bundle (after minification and gzip) for a machine version or migration
  cannot exceed 1mb (1,000,000 bytes). The size of the Javascript bundle after unzipping cannot
  exceed 10mb (10,000,000 bytes).
- By default, any spawned services live only as long as the processing of the current event,
  which is limited to at most 90 seconds.
  By using the `spawnPersistentInstance` method or specifying a persistent actor as an invoke source with the
  `persistentInvocableSource` from `@statebacked/machine`, your machine instances can launch persistent
  child instances 
- Delayed events, child instance spawning, and inter-machine events will be attempted at most
  5 times. If every attempt to deliver the event fails
  (e.g. the machine throws or times out before transitioning), the event will be discarded.

# Validations

- Machine names may be between 1 and 128 characters from the set A-Za-z_-
- Machine instance names may be between 1 and 128 characters from the set A-Za-z_-

# Library support

- State Backed is built and tested against machines built with xstate v4.x. We are working on extending support to v5.
