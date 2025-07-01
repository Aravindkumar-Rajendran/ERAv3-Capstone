import React, { useState } from 'react';
import { MindmapComponentProps } from '../../types/mindmap';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  Modal,
  Fade,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';

interface ExtendedMindmapComponentProps extends MindmapComponentProps {
  onRetry?: () => void;
  isGenerating?: boolean;
}

const MindmapComponent: React.FC<ExtendedMindmapComponentProps> = ({
  mindmapData,
  isOpen,
  onClose,
  onRetry,
  isGenerating = false,
}) => {
  const theme = useTheme();
  const [zoom, setZoom] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  React.useEffect(() => {
    if (mindmapData) {
      setExpandedNodes(new Set(['root']));
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [mindmapData?.id]);

  if (!mindmapData || !mindmapData.levels || !Array.isArray(mindmapData.levels) || mindmapData.levels.length === 0) {
    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              maxWidth: 400,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Error Loading Mindmap
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Unable to load mindmap data. Please try again.
            </Typography>
            {onRetry && (
              <Button
                variant="contained"
                color="primary"
                onClick={onRetry}
                startIcon={<RefreshIcon />}
                sx={{ mr: 2 }}
              >
                Retry
              </Button>
            )}
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </Paper>
        </Fade>
      </Modal>
    );
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => Math.max(0.5, Math.min(2, prevZoom * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPanOffset({ x: newX, y: newY });
      e.preventDefault();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      e.preventDefault();
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (nodeId: string, hasChildren: boolean) => {
    if (!isDragging && hasChildren) {
      toggleNode(nodeId);
    }
  };

  const hasChildren = (nodeId: string) => {
    try {
      return mindmapData.levels.some(
        (level) =>
          level.nodes &&
          Array.isArray(level.nodes) &&
          level.nodes.some((node) => node.parent === nodeId)
      );
    } catch (error) {
      console.error('Error checking children:', error);
      return false;
    }
  };

  const getVisibleNodes = () => {
    try {
      const visibleNodes: Array<{ node: any; level: number; isLast: boolean }> = [];

      const buildTreeOrder = (parentId: string | null, currentLevel: number) => {
        const levelData = mindmapData.levels.find((l) => l.level === currentLevel);
        if (!levelData || !levelData.nodes) return;

        const children = levelData.nodes.filter((node) => {
          if (currentLevel === 0) return !node.parent;
          return node.parent === parentId;
        });

        children.forEach((child, index) => {
          if (!child || !child.id || !child.label) return;

          const isLast = index === children.length - 1;
          visibleNodes.push({ node: child, level: currentLevel, isLast });

          if (expandedNodes.has(child.id)) {
            buildTreeOrder(child.id, currentLevel + 1);
          }
        });
      };

      buildTreeOrder(null, 0);
      return visibleNodes;
    } catch (error) {
      console.error('Error building mindmap tree:', error);
      return [];
    }
  };

  const getLevelColors = (level: number) => {
    const baseColor = theme.palette.primary.main;
    const opacity = Math.max(0.3, 1 - level * 0.2);
    return {
      background: theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
      border: baseColor,
      text: theme.palette.text.primary,
    };
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'relative',
            width: '95vw',
            height: '90vh',
            maxWidth: 1200,
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">{mindmapData.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Zoom Out">
                <IconButton
                  onClick={() => setZoom((prev) => Math.max(0.5, prev * 0.9))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Zoom">
                <IconButton
                  onClick={() => {
                    setZoom(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton
                  onClick={() => setZoom((prev) => Math.min(2, prev * 1.1))}
                  disabled={zoom >= 2}
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Mindmap Content */}
          <Box
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            sx={{
              height: 'calc(100% - 64px)',
              overflow: 'hidden',
              position: 'relative',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            {isGenerating ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
              >
                {getVisibleNodes().map(({ node, level, isLast }, index) => {
                  const colors = getLevelColors(level);
                  const hasNodeChildren = hasChildren(node.id);
                  const isExpanded = expandedNodes.has(node.id);

                  return (
                    <Box
                      key={node.id}
                      onClick={() => handleNodeClick(node.id, hasNodeChildren)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: isLast ? 0 : 2,
                        pl: level * 4,
                        transition: 'all 0.3s ease',
                        cursor: hasNodeChildren ? 'pointer' : 'default',
                      }}
                    >
                      {hasNodeChildren && (
                        <ExpandIcon
                          sx={{
                            mr: 1,
                            transform: isExpanded ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      )}
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          bgcolor: colors.background,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 2,
                          minWidth: 150,
                          '&:hover': {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: colors.text,
                            fontWeight: level === 0 ? 600 : 400,
                          }}
                        >
                          {node.label}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default MindmapComponent; 