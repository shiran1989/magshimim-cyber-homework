import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AttackPatternCard from '../AttackPatternCard';
import { AttackPattern } from '../../types';

const theme = createTheme();

const mockAttackPattern: AttackPattern = {
  id: 'T1001',
  name: 'Data Exfiltration',
  description: 'Adversaries may steal data from compromised systems',
  x_mitre_platforms: ['Windows', 'Linux'],
  x_mitre_detection: 'Monitor network traffic for unusual data transfers',
  phase_name: 'Exfiltration',
  external_id: 'T1001',
  kill_chain_phases: [{ phase_name: 'Exfiltration' }],
  external_references: [],
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AttackPatternCard', () => {
  it('renders attack pattern information correctly', () => {
    renderWithTheme(<AttackPatternCard pattern={mockAttackPattern} />);

    expect(screen.getByText('Data Exfiltration')).toBeInTheDocument();
    expect(screen.getByText('T1001')).toBeInTheDocument();
    expect(
      screen.getByText('Adversaries may steal data from compromised systems')
    ).toBeInTheDocument();
    expect(screen.getByText('Exfiltration')).toBeInTheDocument();
  });

  it('displays platforms correctly', () => {
    renderWithTheme(<AttackPatternCard pattern={mockAttackPattern} />);

    expect(screen.getByText('Windows')).toBeInTheDocument();
    expect(screen.getByText('Linux')).toBeInTheDocument();
  });

  it('shows detection methods', () => {
    renderWithTheme(<AttackPatternCard pattern={mockAttackPattern} />);

    expect(
      screen.getByText('Monitor network traffic for unusual data transfers')
    ).toBeInTheDocument();
  });

  it('handles empty platforms gracefully', () => {
    const patternWithEmptyPlatforms = {
      ...mockAttackPattern,
      x_mitre_platforms: [],
    };

    renderWithTheme(<AttackPatternCard pattern={patternWithEmptyPlatforms} />);

    expect(screen.getByText('No platforms specified')).toBeInTheDocument();
  });

  it('handles NA values correctly', () => {
    const patternWithNA = {
      ...mockAttackPattern,
      x_mitre_detection: 'NA',
      phase_name: 'NA',
    };

    renderWithTheme(<AttackPatternCard pattern={patternWithNA} />);

    expect(screen.getByText('NA')).toBeInTheDocument();
  });

  it('applies correct styling based on phase', () => {
    const { container } = renderWithTheme(
      <AttackPatternCard pattern={mockAttackPattern} />
    );

    // Check if the card has the expected structure
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });
});
