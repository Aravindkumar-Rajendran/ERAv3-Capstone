import React, { useState, useEffect, useRef } from 'react';
import { MindmapComponentProps, MindmapData, MindmapNode as MindmapNodeType } from '../../types/mindmap';
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
import * as d3 from 'd3';

interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
}

interface D3Node extends d3.HierarchyPointNode<HierarchyNode> {}

interface D3Link extends d3.HierarchyLink<HierarchyNode> {
  source: D3Node;
  target: D3Node;
}

interface ExtendedMindmapComponentProps extends MindmapComponentProps {
  onRetry?: () => void;
  isGenerating?: boolean;
}

// Convert MindmapData to hierarchy structure
const convertToHierarchy = (data: MindmapData): HierarchyNode => {
  const root: HierarchyNode = {
    name: data.title,
    children: []
  };

  // Sort levels by level number
  const sortedLevels = [...data.levels].sort((a, b) => a.level - b.level);

  // Create a map to store nodes by their IDs
  const nodeMap = new Map<string, HierarchyNode>();
  nodeMap.set('root', root);

  // Process each level
  sortedLevels.forEach(level => {
    level.nodes.forEach(node => {
      const hierarchyNode: HierarchyNode = {
        name: node.label,
        children: []
      };
      nodeMap.set(node.id, hierarchyNode);

      // Add to parent's children
      const parentNode = node.parent === null ? root : nodeMap.get(node.parent);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(hierarchyNode);
      }
    });
  });

  return root;
};

export const MindmapComponent: React.FC<ExtendedMindmapComponentProps> = ({
  mindmapData,
  isOpen,
  onClose,
  onRetry,
  isGenerating = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !mindmapData) return;

    // Clear existing content
    svgRef.current.innerHTML = '';

    const margin = { top: 40, right: 90, bottom: 50, left: 90 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // Convert data to hierarchy structure
    const hierarchyData = d3.hierarchy(convertToHierarchy(mindmapData));

    // Create tree layout with increased spacing
    const treeLayout = d3.tree<HierarchyNode>()
      .size([height, width])
      .nodeSize([80, 160]); // Increased spacing

    const tree = treeLayout(hierarchyData) as unknown as d3.HierarchyPointNode<HierarchyNode>;
    const descendants = tree.descendants() as d3.HierarchyPointNode<HierarchyNode>[];
    const links = tree.links() as d3.HierarchyPointLink<HierarchyNode>[];

    // Create SVG with better margins
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left + width/4},${margin.top})`);

    // Add links with curved paths
    svg.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
        .x(d => d.y)
        .y(d => d.x));

    // Add nodes with improved styling
    const nodes = svg.selectAll<SVGGElement, d3.HierarchyPointNode<HierarchyNode>>(".node")
      .data(descendants)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Add node circles with better styling
    nodes.append("circle")
      .attr("r", 10)
      .style("fill", "#fff")
      .style("stroke", theme.palette.primary.main)
      .style("stroke-width", 3)
      .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))");

    // Add node labels with improved styling
    nodes.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -16 : 16)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("font-family", theme.typography.fontFamily || "Arial")
      .style("font-size", "14px")
      .style("font-weight", d => d.depth === 0 ? "bold" : "normal")
      .style("fill", theme.palette.text.primary)
      .each(function(this: SVGTextElement) {
        // Add background rectangle with improved styling
        const bbox = this.getBBox();
        const padding = 6;
        
        d3.select(this.parentNode as Element)
          .insert("rect", "text")
          .attr("x", bbox.x - padding)
          .attr("y", bbox.y - padding)
          .attr("width", bbox.width + (padding * 2))
          .attr("height", bbox.height + (padding * 2))
          .attr("fill", theme.palette.background.paper)
          .attr("fill-opacity", 0.95)
          .attr("rx", 6)
          .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.1))");
      });

    // Add improved zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        svg.attr("transform", `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`);
      });

    d3.select(svgRef.current)
      .call(zoom)
      .call(zoom.translateTo, width / 3, height / 2);

  }, [mindmapData, theme]);

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
            p: 2,
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '100%',
            height: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {!mindmapData ? (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="h5" gutterBottom>
                {isGenerating ? 'Generating Mindmap...' : 'Error Loading Mindmap'}
              </Typography>
              {isGenerating ? (
                <CircularProgress sx={{ my: 2 }} />
              ) : (
                <>
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
                </>
              )}
              <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
                Close
              </Button>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '70vh', overflow: 'auto', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg ref={svgRef} style={{ display: 'block' }} />
            </Box>
          )}
        </Paper>
      </Fade>
    </Modal>
  );
};

export default MindmapComponent; 