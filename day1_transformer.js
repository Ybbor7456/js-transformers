import fs from "node:fs";

/* JSON properties
id
name
team
score
active
*/ 

function readJsonArray(path) {
  let raw;
  try {     // try and catch are usually not used in embedded prog. due to overhead + unpredictable timing to catch/throw
    raw = fs.readFileSync(path, "utf8"); // a synchronous function in Node.js used to read the contents of a file from the filesystem
    // synchronous - blocks main execution of javascript thread until file read 
  } catch (err) {
    console.error(`[ERROR] Cannot read ${path}: ${err.message}`);
    process.exit(1); // Node.js to immediately terminate the process
  }

  let parsed;
  try {
    parsed = JSON.parse(raw); // parse a JSON-formatted string and convert it into a native JavaScript value or object
  } catch (err) {
    console.error(`[ERROR] Invalid JSON in ${path}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) { //executes a block of code only if the variable parsed is not an array
    console.error(`[ERROR] Expected ${path} to contain a JSON array.`);
    process.exit(1);
  }

  return parsed;
}

const INPUT_PATH = "./data.json"; // where data is coming from JSON - javasript object notation 
const OUT_PATH = "./out.json";      // writing to the file. 

const data = readJsonArray(INPUT_PATH); // user defined fnx above

// 1) activeUsers: only active === true
const activeUsers = data.filter(u => u.active === true); // creates new array from data where active property is strictly true

// 2) top3ByScore: top 3 by score (descending)
const top3ByScore = [...data] // create a shallow copy of the data array, making fnx new array w/ the same elements as data
  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)) // sorts and subtracts scores in ascending order
  .slice(0, 3); // gives top 3 elements in array (doesnt incldue 3)

// 3) scoresByTeam: total score per team
const scoresByTeam = data.reduce((acc, u) => {
    const team = String(u.team ?? "Unknown"); 
    const score = Number(u.score ?? 0); 
    acc[team] = (acc[team] ?? 0) + score; return acc; }, {});

// 4) names: array of just names
const names = data.map(u => u.name);

// Print results
console.log("\n=== Day 1 Transformer Outputs ===\n");
console.log("activeUsers:");
console.table(activeUsers);

console.log("\ntop3ByScore:");
console.table(top3ByScore);

console.log("\nscoresByTeam:");
console.log(scoresByTeam);

console.log("\nnames:");
console.log(names);

// Write everything to out.json
const out = { activeUsers, top3ByScore, scoresByTeam, names };
fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
