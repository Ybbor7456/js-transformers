#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { parseArgs, usage } from "./src/args.js";
import { loadJsonArray } from "./src/io.js";
import { transform } from "./src/transform.js";

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

  if (args.pretty) {
    console.error("\n=== Debug Output (pretty) ===\n");
    console.error("activeUsers:"); console.table(out.activeUsers);
    console.error("\ntop3ByScore:"); console.table(out.top3ByScore);
    console.error("\nscoresByTeam:"); console.error(out.scoresByTeam);
    console.error("\nnames:"); console.error(out.names);
  }

  const json = JSON.stringify(out, null, 2) + "\n";
  process.stdout.write(json);

  if (args.out) {
    await writeFile(args.out, json, "utf8");
  }
}

main().catch(err => {
  console.error(`[ERROR] ${err?.message ?? String(err)}`);
  process.exitCode = 1;
});

/* 
argv[0] = path to the Node executable (e.g., C:\Program Files\nodejs\node.exe)
argv[1] = path to your script (e.g., C:\...\day2_transformer.mjs)
argv[2] = your first real argument (--input)
argv[3] = value for that arg (data.json)
argv[4] = --out
argv[5] = out.json
*/ 