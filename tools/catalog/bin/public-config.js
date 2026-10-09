#!/usr/bin/env node
// Prints the public config scope (mixerConfig + productIndexerConfig) for moved-permanently/lmh.
import { publicConfig } from '../src/config.js';

process.stdout.write(`${JSON.stringify(publicConfig(), null, 2)}\n`);
