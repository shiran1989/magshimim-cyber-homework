import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { AccountTree, Search } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AttackPattern } from '../types';

interface TechniqueRelationshipsProps {
  patterns: AttackPattern[];
  isLoading: boolean;
  error?: string;
}

interface RelationshipNode {
  id: string;
  name: string;
  phase: string;
  platforms: string[];
  x: number;
  y: number;
  level: number;
}

interface RelationshipEdge {
  source: string;
  target: string;
  type: 'phase' | 'platform' | 'keyword';
  strength: number;
}

interface RelationshipGraph {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
}

const TechniqueRelationships: React.FC<TechniqueRelationshipsProps> = ({
  patterns,
  error,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<AttackPattern | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatterns, setFilteredPatterns] = useState<AttackPattern[]>([]);
  const [relationshipGraph, setRelationshipGraph] = useState<RelationshipGraph>(
    {
      nodes: [],
      edges: [],
    }
  );
  const [showDetails, setShowDetails] = useState(false);
  // const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null);

  // Filter patterns based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatterns(patterns);
    } else {
      const filtered = patterns.filter(
        pattern =>
          pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pattern.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          pattern.phase_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatterns(filtered);
    }
  }, [searchQuery, patterns]);

  // Generate relationship graph
  const generateRelationshipGraph = useMemo(() => {
    return (patterns: AttackPattern[]): RelationshipGraph => {
      const nodes: RelationshipNode[] = [];
      const edges: RelationshipEdge[] = [];

      // Create nodes for each pattern
      patterns.forEach((pattern, index) => {
        const node: RelationshipNode = {
          id: pattern.id,
          name: pattern.name,
          phase: pattern.phase_name,
          platforms: pattern.x_mitre_platforms,
          x: (index % 5) * 200 + 100,
          y: Math.floor(index / 5) * 150 + 100,
          level: getPhaseLevel(pattern.phase_name),
        };
        nodes.push(node);
      });

      // Create edges based on relationships
      patterns.forEach(pattern1 => {
        patterns.forEach(pattern2 => {
          if (pattern1.id !== pattern2.id) {
            const relationship = calculateRelationship(pattern1, pattern2);
            if (relationship.strength > 0.3) {
              edges.push({
                source: pattern1.id,
                target: pattern2.id,
                type: relationship.type,
                strength: relationship.strength,
              });
            }
          }
        });
      });

      return { nodes, edges };
    };
  }, []);

  // Calculate relationship strength between two patterns
  const calculateRelationship = (
    pattern1: AttackPattern,
    pattern2: AttackPattern
  ) => {
    let strength = 0;
    let type: 'phase' | 'platform' | 'keyword' = 'phase';

    // Phase similarity
    if (
      pattern1.phase_name === pattern2.phase_name &&
      pattern1.phase_name !== 'NA'
    ) {
      strength += 0.4;
      type = 'phase';
    }

    // Platform similarity
    const commonPlatforms = pattern1.x_mitre_platforms.filter(
      platform =>
        pattern2.x_mitre_platforms.includes(platform) && platform !== 'NA'
    );
    if (commonPlatforms.length > 0) {
      strength +=
        0.3 *
        (commonPlatforms.length /
          Math.max(
            pattern1.x_mitre_platforms.length,
            pattern2.x_mitre_platforms.length
          ));
      type = 'platform';
    }

    // Keyword similarity in description
    const words1 = pattern1.description.toLowerCase().split(/\W+/);
    const words2 = pattern2.description.toLowerCase().split(/\W+/);
    const commonWords = words1.filter(
      word => words2.includes(word) && word.length > 3
    );
    if (commonWords.length > 0) {
      strength +=
        0.2 * (commonWords.length / Math.max(words1.length, words2.length));
      type = 'keyword';
    }

    return { strength, type };
  };

  // Get phase level for visualization
  const getPhaseLevel = (phase: string): number => {
    const phaseLevels: { [key: string]: number } = {
      'Initial Access': 1,
      Execution: 2,
      Persistence: 3,
      'Privilege Escalation': 4,
      'Defense Evasion': 5,
      'Credential Access': 6,
      Discovery: 7,
      'Lateral Movement': 8,
      Collection: 9,
      'Command and Control': 10,
      Exfiltration: 11,
      Impact: 12,
    };
    return phaseLevels[phase] || 0;
  };

  // Update graph when patterns change
  useEffect(() => {
    const graph = generateRelationshipGraph(filteredPatterns);
    setRelationshipGraph(graph);
  }, [filteredPatterns, generateRelationshipGraph]);

  const getPhaseColor = (phase: string): string => {
    const colors: { [key: string]: string } = {
      'Initial Access': '#e3f2fd',
      Execution: '#f3e5f5',
      Persistence: '#fff3e0',
      'Privilege Escalation': '#e8f5e8',
      'Defense Evasion': '#ffebee',
      'Credential Access': '#fce4ec',
      Discovery: '#f1f8e9',
      'Lateral Movement': '#e0f2f1',
      Collection: '#fff8e1',
      'Command and Control': '#e3f2fd',
      Exfiltration: '#ffebee',
      Impact: '#fce4ec',
    };
    return colors[phase] || '#f5f5f5';
  };

  const getRelationshipColor = (type: string): string => {
    switch (type) {
      case 'phase':
        return '#1976d2';
      case 'platform':
        return '#388e3c';
      case 'keyword':
        return '#f57c00';
      default:
        return '#9e9e9e';
    }
  };

  const handleNodeClick = (node: RelationshipNode) => {
    const pattern = patterns.find(p => p.id === node.id);
    if (pattern) {
      setSelectedPattern(pattern);
      // setSelectedNode(node);
      setShowDetails(true);
    }
  };

  const getRelatedPatterns = (patternId: string) => {
    return relationshipGraph.edges
      .filter(edge => edge.source === patternId || edge.target === patternId)
      .map(edge => {
        const relatedId = edge.source === patternId ? edge.target : edge.source;
        const relatedPattern = patterns.find(p => p.id === relatedId);
        return { pattern: relatedPattern, relationship: edge };
      })
      .filter(item => item.pattern)
      .sort((a, b) => b.relationship.strength - a.relationship.strength);
  };

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          🔗 Technique Relationships
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size='small'
            placeholder='Search techniques...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
        </Box>
      </Box>

      {/* Relationship Visualization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Attack Pattern Relationship Network
          </Typography>
          <Box
            sx={{
              position: 'relative',
              height: '600px',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
              background:
                'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            {/* Render nodes */}
            {relationshipGraph.nodes.map(node => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Tooltip title={`${node.name} (${node.phase})`}>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => handleNodeClick(node)}
                    sx={{
                      backgroundColor: getPhaseColor(node.phase),
                      color: 'text.primary',
                      minWidth: '120px',
                      maxWidth: '150px',
                      height: '40px',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 'bold', display: 'block' }}
                      >
                        {node.name.length > 15
                          ? `${node.name.substring(0, 15)}...`
                          : node.name}
                      </Typography>
                      <Chip
                        label={node.phase}
                        size='small'
                        sx={{ fontSize: '0.6rem', height: '16px', mt: 0.5 }}
                      />
                    </Box>
                  </Button>
                </Tooltip>
              </motion.div>
            ))}

            {/* Render edges */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {relationshipGraph.edges.map((edge, index) => {
                const sourceNode = relationshipGraph.nodes.find(
                  n => n.id === edge.source
                );
                const targetNode = relationshipGraph.nodes.find(
                  n => n.id === edge.target
                );
                if (!sourceNode || !targetNode) return null;

                return (
                  <motion.line
                    key={`${edge.source}-${edge.target}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={getRelationshipColor(edge.type)}
                    strokeWidth={edge.strength * 3}
                    opacity={0.6}
                    strokeDasharray={edge.type === 'keyword' ? '5,5' : '0'}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                );
              })}
            </svg>
          </Box>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Relationship Types
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 3,
                    backgroundColor: '#1976d2',
                    borderRadius: 1,
                  }}
                />
                <Typography variant='body2'>Phase Similarity</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 3,
                    backgroundColor: '#388e3c',
                    borderRadius: 1,
                  }}
                />
                <Typography variant='body2'>Platform Similarity</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 3,
                    backgroundColor: '#f57c00',
                    borderRadius: 1,
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #f57c00, #f57c00 5px, transparent 5px, transparent 10px)',
                  }}
                />
                <Typography variant='body2'>Keyword Similarity</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Pattern Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTree />
            <Typography variant='h6'>{selectedPattern?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPattern && (
            <Box>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {selectedPattern.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant='h6' gutterBottom>
                Related Techniques
              </Typography>
              <Grid container spacing={2}>
                {getRelatedPatterns(selectedPattern.id).map(
                  ({ pattern, relationship }) => (
                    <Grid item xs={12} sm={6} key={pattern!.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant='subtitle1'
                              sx={{ fontWeight: 'bold' }}
                            >
                              {pattern!.name}
                            </Typography>
                            <Chip
                              label={`${Math.round(relationship.strength * 100)}%`}
                              size='small'
                              color='primary'
                            />
                          </Box>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            {pattern!.description.substring(0, 100)}...
                          </Typography>
                          <Box
                            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                          >
                            <Chip label={pattern!.phase_name} size='small' />
                            {pattern!.x_mitre_platforms
                              .slice(0, 2)
                              .map(platform => (
                                <Chip
                                  key={platform}
                                  label={platform}
                                  size='small'
                                  variant='outlined'
                                />
                              ))}
                          </Box>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={relationship.type}
                              size='small'
                              sx={{
                                backgroundColor: getRelationshipColor(
                                  relationship.type
                                ),
                                color: 'white',
                              }}
                            />
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  )
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechniqueRelationships;
