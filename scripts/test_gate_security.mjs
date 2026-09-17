// Compatibility entry point for the complete route, RSC, browser and DEV persistence gate.
// Requires GATE_BASE_URL and the same environment as scripts/release-gate.mjs.
await import('./release-gate.mjs')
