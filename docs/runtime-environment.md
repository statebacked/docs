---
sidebar_position: 5
---

# Runtime environment

Machine instances run in a web standards-like environment with access to 128mb of memory but no filesystem access.

The State Backed environment supports ECMAScript 2022 Javascript features.

This means that you have access to globals like `fetch`, `Promise`, `TextEncoder`, `TextDecoder`, `URL`,
`URLSearchParams`, `crypto`, `FormData`, `CompressionStream`, `Blob`, etc.
Essentially, everything that [Deno](https://deno.land/manual@v1.35.0/runtime/web_platform_apis)
or the [WinterCG](https://github.com/wintercg) exposes is available
**except for** the `Deno` global, high-resolution timers, and filesystem access.
