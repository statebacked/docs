---
sidebar_position: 6
---

# Limits

- Machine instances execute in a web standards-like environment with 128mb of memory.
- When a machine receives an event, it has 10 seconds to ["settle"](./settling), where "settling" means
  that it has not child services running and it is not waiting on any "immediate" delays.
  An "immediate" delay is one that is scheduled to run before the 10 second event timeout.
  If a machine exceeds this 10 second timeout and made at least one successful transition,
  State Backed will respond with the latest machine state.
  In all cases, after the 10 second timeout, any running services will be stopped.
  When **the next** event is sent to the machine instance, State Backed will first deliver
  error events for each service that was active during the timeout and will then deliver
  the new event.
- Context may never exceed 400kb when represented as JSON in UTF8. If context exceeds
  this size, the transition will fail and the request that delivered the event that caused
  context to exceed that size will fail. The state of the machine instance will be as though
  the failing event never occurred.
- The size of the Javascript bundle for a machine version cannot exceed 1mb (1,000,000 bytes).
