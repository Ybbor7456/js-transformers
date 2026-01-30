export type CliArgs = {
  input?: string;
  out?: string;
  team?: string;
  minScore?: number;
  pretty?: boolean;
  help?: boolean;
};

export type User = {
  id: number;
  name: string;
  team: string;
  score: number;
  active: boolean;
  // Allow extra fields without breaking:
  [key: string]: unknown;
};

export type Summary = {
  activeUsers: User[];
  top3ByScore: User[];
  scoresByTeam: Record<string, number>;
  names: string[];
};
