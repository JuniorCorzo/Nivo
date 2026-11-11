#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const rawArgs = process.argv.slice(2);
const files = rawArgs.filter((arg) => arg !== "run" && !arg.startsWith("-"));
const flags = rawArgs.filter((arg) => arg.startsWith("-"));

const ngArgs = ["test", "--watch=false"];
if (files.length > 0) {
  const pattern = files.length === 1 ? `**/${files[0]}` : `{${files.map((f) => `**/${f}`).join(",")}}`;
  ngArgs.push(`--include=${pattern}`);
}

const result = spawnSync("ng", [...ngArgs, ...flags], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 0);
