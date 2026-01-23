#!/usr/bin/env node 
// makes the script portable because it tells the system to find the node interpreter in the user's PATH environment variable

import { readFile, writeFile } from "node:fs/promises";
// node day3_transformer.mjs --input data.json --out out.json
// input/output, CLI flags, Transform outputs, 
// Error handling, how I run it, packaging, tests, powershell
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) { // checks to see argument taken 
    const a = argv[i];  // argv[0] = node path, argv[1] = script path
    if (a === "--input" || a === "-i") args.input = needValue(argv, i, a), i++;
    else if (a === "--out" || a === "-o") args.out = needValue(argv, i, a), i++; 
    else if (a === "--team") args.team = needValue(argv, i, a), i++;
    else if (a === "--minScore") args.minScore = Number(needValue(argv, i, a)), i++;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--pretty") args.pretty = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function needValue(argv, i, flagName) {
  const v = argv[i + 1];
  // allow stdin sentinel for input only
  if (v === "-" && (flagName === "-i" || flagName === "--input")) return v;
  if (!v || v.startsWith("-")) throw new Error(`Missing value for ${flagName}`);
  return v;
}

async function readStdin() {
  // If running interactively with no pipe, stdin is a TTY
  if (process.stdin.isTTY) {
    throw new Error('Input is "-" but no data was piped in. Example: type data.json | node day4_transformer.mjs -i -');
  }

  process.stdin.setEncoding("utf8");

  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  if (!raw.trim()) {
    throw new Error('Received empty stdin input (using "-").');
  }

  return raw;
}

function usage() {
  return `
Usage:
  node day4_transformer.mjs -i data.json [options]

Options:
  -i, --input <path>      Path to input JSON (required)
  -o, --out <path>        Write output JSON to this file. If omitted, writes to stdout.
  --team <name>           Filter by team name
  --minScore <number>     Filter by minimum score
  --pretty                Print debug tables to stderr
  -h, --help              Show this message

Examples:
  node day4_transformer.mjs -i data.json
  node day4_transformer.mjs -i data.json -o out.json
  node day4_transformer.mjs -i data.json --team Alpha --minScore 900 > out.json
`.trim();
}

async function loadJsonArray(path) {
  let raw;

  if (path === "-") {
    raw = await readStdin();
  } else {
    try {
      raw = await readFile(path, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") throw new Error(`Input file not found: ${path}`);
      throw new Error(`Cannot read ${path}: ${err.message}`);
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${path === "-" ? "stdin" : path}: ${err.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${path === "-" ? "stdin" : path} to contain a JSON array.`);
  }

  return parsed;
}


function transform(data, { team, minScore }) { // transform(data, team from json, args)
  let filtered = data;

  if (team) filtered = filtered.filter(u => String(u.team) === team); // // filtered is the working subset of user objects after applying CLI filters
  if (Number.isFinite(minScore)) filtered = filtered.filter(u => Number(u.score ?? 0) >= minScore); // creates new array with score from json

  const activeUsers = filtered.filter(u => u.active === true); // array created for active ffrom json

  const top3ByScore = [...filtered] // same as day1_transformer, sorts top 3 scores
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 3);

  const scoresByTeam = filtered.reduce((acc, u) => { // scores per team in array 
    const t = String(u.team ?? "Unknown");
    const s = Number(u.score ?? 0);
    acc[t] = (acc[t] ?? 0) + s;
    return acc;}, {}); 

  const names = filtered.map(u => String(u.name ?? "")); // 

  return { activeUsers, top3ByScore, scoresByTeam, names }; // returns new arrays
  // activeUsers consists of active from json, top3ByScore has top 3 scores, scoresByTeam returns array with teams and total summed scores
  
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    console.log(usage());
    return;
  }

  if (!args.input) {
    throw new Error(`Missing --input\n\n${usage()}`);
  }

  const data = await loadJsonArray(args.input);
  const out = transform(data, args);

  // Optional: human-readable debug output (stderr so stdout stays clean JSON)
  if (args.pretty) {
    console.error("\n=== Debug Output (pretty) ===\n");
    console.error("activeUsers:"); console.table(out.activeUsers);
    console.error("\ntop3ByScore:"); console.table(out.top3ByScore);
    console.error("\nscoresByTeam:"); console.error(out.scoresByTeam);
    console.error("\nnames:"); console.error(out.names);
  }

  const json = JSON.stringify(out, null, 2) + "\n";

  // Always emit JSON to stdout (CLI-friendly)
  process.stdout.write(json);

  // If --out provided, also write to file
  if (args.out) {
    await writeFile(args.out, json, "utf8");
  }
}

main().catch(err => {
  console.error(`[ERROR] ${err.message ?? String(err)}`);
  process.exitCode = 1;
});