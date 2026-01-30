import { readFile } from "node:fs/promises";
import type { User } from "./types.js";

export async function loadJsonArray(path: string): Promise<User[]> {
  let raw: string;

  try {
    raw = await readFile(path, "utf8");
  } catch (err: any) {
    if (err?.code === "ENOENT") throw new Error(`Input file not found: ${path}`);
    throw new Error(`Cannot read ${path}: ${err?.message ?? String(err)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (err: any) {
    throw new Error(`Invalid JSON in ${path}: ${err?.message ?? String(err)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${path} to contain a JSON array.`);
  }

  // Validate each entry enough to be safe for your transform
  const out: User[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!isObject(item)) {
      throw new Error(`Item at index ${i} must be an object.`);
    }

    // Required fields + basic typing
    const id = item["id"];
    const name = item["name"];
    const team = item["team"];
    const score = item["score"];
    const active = item["active"];

    if (typeof id !== "number") throw new Error(`Item ${i}: id must be a number.`);
    if (typeof name !== "string") throw new Error(`Item ${i}: name must be a string.`);
    if (typeof team !== "string") throw new Error(`Item ${i}: team must be a string.`);
    if (typeof score !== "number") throw new Error(`Item ${i}: score must be a number.`);
    if (typeof active !== "boolean") throw new Error(`Item ${i}: active must be a boolean.`);

    out.push(item as User);
  }

  return out;
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
