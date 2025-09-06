import { useTheme } from '@mui/material/styles';
import { CybersecurityColors } from '../types';

// Hook to get cybersecurity colors
export const useCybersecurityColors = () => {
  const theme = useTheme();
  return theme.palette.cybersecurity;
};

// Get phase color by phase name
export const getPhaseColor = (
  phaseName: string,
  colors: CybersecurityColors
): string => {
  const phaseMap: { [key: string]: keyof CybersecurityColors['phase'] } = {
    'initial-access': 'initialAccess',
    execution: 'execution',
    persistence: 'persistence',
    'privilege-escalation': 'privilegeEscalation',
    'defense-evasion': 'defenseEvasion',
    'credential-access': 'credentialAccess',
    discovery: 'discovery',
    'lateral-movement': 'lateralMovement',
    collection: 'collection',
    'command-and-control': 'commandAndControl',
    exfiltration: 'exfiltration',
    impact: 'impact',
  };

  const normalizedPhase = phaseName.toLowerCase().replace(/\s+/g, '-');
  const phaseKey = phaseMap[normalizedPhase];

  if (phaseKey) {
    return colors.phase[phaseKey];
  }

  // Default color for unknown phases
  return colors.info;
};

// Get platform color by platform name
export const getPlatformColor = (
  platformName: string,
  colors: CybersecurityColors
): string => {
  const platformMap: { [key: string]: keyof CybersecurityColors['platform'] } =
    {
      windows: 'windows',
      linux: 'linux',
      macos: 'macos',
      'mac os': 'macos',
      'mac os x': 'macos',
      network: 'network',
      'network devices': 'network',
      containers: 'containers',
      container: 'containers',
      esxi: 'esxi',
      'vmware esxi': 'esxi',
    };

  const normalizedPlatform = platformName.toLowerCase();
  const platformKey = platformMap[normalizedPlatform];

  if (platformKey) {
    return colors.platform[platformKey];
  }

  // Default color for unknown platforms
  return colors.info;
};

// Get risk level color
export const getRiskLevelColor = (
  riskLevel: 'critical' | 'high' | 'medium' | 'low',
  colors: CybersecurityColors
): string => {
  return colors[riskLevel];
};

// Generate consistent colors for charts
export const getChartColors = (
  count: number,
  colors: CybersecurityColors
): string[] => {
  const baseColors = [
    colors.phase.initialAccess,
    colors.phase.execution,
    colors.phase.persistence,
    colors.phase.privilegeEscalation,
    colors.phase.defenseEvasion,
    colors.phase.credentialAccess,
    colors.phase.discovery,
    colors.phase.lateralMovement,
    colors.phase.collection,
    colors.phase.commandAndControl,
    colors.phase.exfiltration,
    colors.phase.impact,
  ];

  const chartColors: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = baseColors[i % baseColors.length];
    if (color) {
      chartColors.push(color);
    }
  }

  return chartColors;
};
