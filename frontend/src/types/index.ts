export interface AttackPattern {
  id: string;
  name: string;
  description: string;
  x_mitre_platforms: string[];
  x_mitre_detection: string;
  phase_name: string;
  external_id: string;
  kill_chain_phases: Array<{
    phase_name: string;
  }>;
  external_references: Array<{
    source_name: string;
    external_id: string;
    url?: string;
  }>;
  created_at: string;
  modified_at: string;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: AttackPattern[];
  total: number;
  limit: number;
  offset: number;
}

export interface StatsResponse {
  total_patterns: number;
  phase_distribution: Array<{
    _id: string;
    count: number;
  }>;
  platform_distribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ApiError {
  detail: string;
  status?: number;
}

// Cybersecurity theme colors
export interface CybersecurityColors {
  critical: string;
  high: string;
  medium: string;
  low: string;
  info: string;
  phase: {
    initialAccess: string;
    execution: string;
    persistence: string;
    privilegeEscalation: string;
    defenseEvasion: string;
    credentialAccess: string;
    discovery: string;
    lateralMovement: string;
    collection: string;
    commandAndControl: string;
    exfiltration: string;
    impact: string;
  };
  platform: {
    windows: string;
    linux: string;
    macos: string;
    network: string;
    containers: string;
    esxi: string;
  };
}

// Extend Material-UI theme
declare module '@mui/material/styles' {
  interface Palette {
    cybersecurity: CybersecurityColors;
  }
  interface PaletteOptions {
    cybersecurity?: CybersecurityColors;
  }
}
