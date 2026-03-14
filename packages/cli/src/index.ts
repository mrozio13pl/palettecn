#!/usr/bin/env node
import opener from 'opener';

// @ts-expect-error imported at build-time
await import('./web/server/index.mjs');

opener('http://localhost:3000');
