---
sidebar_position: 7
---

# Logs

Your machine instances can log to stdout or stderr as you process transitions,
evaluate guards, execute actions, run services, determine authorization,
or migrate instances.

All logs are captured and made available through the `smply` CLI.

Log retention is based on your [plan](./pricing).

## Web dashboard

You can view logs at the machine or machine instance level in the [dashboard](https://www.statebacked.dev/machines).

## CLI

Retrieve a batch of logs

```bash
smply logs get
    --from -10m # ISO8601 or relative timestamp (-10m = 10 minutes ago) (required)
    --to 5m # ISO8601 or relative timestamp (relative to from) (optional)
    --machine my-machine # machine name (optional)
    --instance my-instance # instance name (optional)
    --version ver_... # version id (optional)
    --clean # see below (optional)
```

By default, logs are displayed as arrays of JSON objects where each JSON object contains
the machine, instance, and version that the logs were collected from.
Passing `--clean` displays "clean logs", which consist of only a header with the machine, instance,
and version the logs relate to, followed by a blank line and only the text of the logs that
were collected.

Watch for new logs (same options as `smply logs get`)

```bash
smply logs watch
    --from -10m # ISO8601 or relative timestamp (-10m = 10 minutes ago) (required)
    --to 5m # ISO8601 or relative timestamp (relative to from) (optional)
    --machine my-machine # machine name (optional)
    --instance my-instance # instance name (optional)
    --version ver_... # version id (optional)
    --clean # see below (optional)
```