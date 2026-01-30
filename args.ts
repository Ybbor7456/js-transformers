import type { CliArgs } from "./types.js";

export function usage(): string {
  return `
Usage:
  node dist/cli.js --input data.json [--out out.json] [--team Alpha] [--minScore 900] [--pretty] [--help]

Options:
  --input      Path to input JSON (required)
  --out        Write output JSON to file (optional)
  --team       Filter by team name
  --minScore   Filter by minimum score (number)
  --pretty     Print human-friendly debug output to stderr
  --help       Show this message
`.trim();
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];

    if (a === "--input") args.input = requireValue(argv, ++i, "--input");
    else if (a === "--out") args.out = requireValue(argv, ++i, "--out");
    else if (a === "--team") args.team = requireValue(argv, ++i, "--team");
    else if (a === "--minScore") {
      const raw = requireValue(argv, ++i, "--minScore");
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`--minScore must be a number, got: ${raw}`);
      args.minScore = n;
    }
    else if (a === "--pretty") args.pretty = true;
    else if (a === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${a}\n\n${usage()}`);
  }

  return args;
}

function requireValue(argv: string[], i: number, flag: string): string {
  const v = argv[i];
  if (!v || v.startsWith("--")) {
    throw new Error(`${flag} requires a value\n\n${usage()}`);
  }
  return v;
}
