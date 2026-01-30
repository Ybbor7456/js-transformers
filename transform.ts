import type { CliArgs, Summary, User } from "./types.js";

export function transform(data: User[], args: CliArgs): Summary {
  let filtered = data;

  if (args.team) {
    filtered = filtered.filter(u => u.team === args.team);
  }

  if (Number.isFinite(args.minScore)) {
    const min = args.minScore as number;
    filtered = filtered.filter(u => u.score >= min);
  }

  const activeUsers = filtered.filter(u => u.active === true);

  const top3ByScore = [...filtered]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const scoresByTeam = filtered.reduce<Record<string, number>>((acc, u) => {
    acc[u.team] = (acc[u.team] ?? 0) + u.score;
    return acc;
  }, {});

  const names = filtered.map(u => u.name);

  return { activeUsers, top3ByScore, scoresByTeam, names };
}
