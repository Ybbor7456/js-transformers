import { readFile, writeFile } from "node:fs/promises";


// node day2_transformer.mjs --input data.json --out out.json
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) { // checks to see argument taken 
    const a = argv[i];  // argv[0] = node path, argv[1] = script path
    if (a === "--input") args.input = argv[++i]; // argv[2] = arguent input. argv[3] = data.json
    else if (a === "--out") args.out = argv[++i]; // argv[4] = argument out argv[5] = out.json
    else if (a === "--team") args.team = argv[++i]; 
    else if (a === "--minScore") args.minScore = Number(argv[++i]);
    else if (a === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function usage() { // defines a help message for a Command Line Interface (CLI) tool named day2_transformer.mjs
  return `
Usage:
  node day3_transformer.mjs --input data.json --out out.json [--team Alpha] [--minScore 900]

Options:
  --input     Path to input JSON (required)
  --out       Path to output JSON (default: ./out.json)
  --team      Filter by team name
  --minScore  Filter by minimum score (number)
  --help      Show this message
`.trim(); // removes whitespace, tabs, and newlines
}

async function loadJsonArray(path) {
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") throw new Error(`Input file not found: ${path}`); // ENOENT = error no entry
    throw new Error(`Cannot read ${path}: ${err.message}`); // err.code = error type, error.message = string 
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${path}: ${err.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${path} to contain a JSON array.`);
  }

  return parsed;
}

function transform(data, { team, minScore }) { // transform(data, team from json, args)
  let filtered = data;

  if (team) filtered = filtered.filter(u => String(u.team) === team); // filter() creates sub-array from original
  if (Number.isFinite(minScore)) filtered = filtered.filter(u => Number(u.score ?? 0) >= minScore); // creates new array with score from json
// filtered variable consists of teams, scores
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
    // names consists of array of team names 
}

async function main() { 
  const args = parseArgs(process.argv); // processes command line args, with process.argv array
  if (args.help) {
    console.log(usage()); // calls defined funtion 
    return;
  }

  if (!args.input) {
    throw new Error(`Missing --input\n\n${usage()}`);
  }

  const outPath = args.out ?? "./out.json"; // args.out accesses out property of argument

  const data = await loadJsonArray(args.input); // await pauses the execution until a promise is settled
  const out = transform(data, args); // takes full array of user objects, 2nd arg is object

  console.log("\n=== Day 2 Transformer Outputs ===\n");
  console.log("activeUsers:"); console.table(out.activeUsers);
  console.log("\ntop3ByScore:"); console.table(out.top3ByScore);
  console.log("\nscoresByTeam:"); console.log(out.scoresByTeam);
  console.log("\nnames:"); console.log(out.names);

  await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nWrote ${outPath}`);
}

main().catch(err => {  // returns the promise, promsie rejected if thrown, catch handles 
  console.error(`[ERROR] ${err.message ?? String(err)}`);
  process.exitCode = 1;
});
