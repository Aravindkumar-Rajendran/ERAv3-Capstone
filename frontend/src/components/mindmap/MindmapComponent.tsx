import React, { useState } from 'react';
import { MindmapComponentProps } from '../../types/mindmap';

interface ExtendedMindmapComponentProps extends MindmapComponentProps {
  onRetry?: () => void;
  isGenerating?: boolean;
}

const MindmapComponent: React.FC<ExtendedMindmapComponentProps> = ({ 
  mindmapData, 
  isOpen, 
  onClose,
  onRetry,
  isGenerating = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  
  // Add state for drag-to-pan functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  // Reset expanded nodes when new mindmap data is received
  React.useEffect(() => {
    if (mindmapData) {
      setExpandedNodes(new Set(['root']));
      setZoom(1);
      setPanOffset({ x: 0, y: 0 }); // Reset pan when new data arrives
    }
  }, [mindmapData?.id]); // Only reset when mindmap ID changes

  // Comprehensive data validation
  if (!mindmapData || !mindmapData.levels || !Array.isArray(mindmapData.levels) || mindmapData.levels.length === 0) {
    console.error('Invalid mindmap data structure:', mindmapData);
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Error Loading Mindmap</h2>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>
            Unable to load mindmap data. Please try again.
          </p>
          <button 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.max(0.5, Math.min(2, prevZoom * delta)));
  };

  // Add mouse handlers for drag-to-pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Only left mouse button
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

  // Prevent clicks during drag operations
  const handleNodeClick = (nodeId: string, hasChildren: boolean) => {
    if (!isDragging && hasChildren) {
      toggleNode(nodeId);
    }
  };

  const hasChildren = (nodeId: string) => {
    try {
      return mindmapData.levels.some(level => 
        level.nodes && Array.isArray(level.nodes) && level.nodes.some(node => node.parent === nodeId)
      );
    } catch (error) {
      console.error('Error checking children:', error);
      return false;
    }
  };

  const getVisibleNodes = () => {
    try {
      const visibleNodes: Array<{ node: any, level: number, isLast: boolean }> = [];
      
      // Helper function to build tree recursively in proper order
      const buildTreeOrder = (parentId: string | null, currentLevel: number) => {
        // Find nodes for current level
        const levelData = mindmapData.levels.find(l => l.level === currentLevel);
        if (!levelData || !levelData.nodes) return;
        
        // Get children of this parent
        const children = levelData.nodes.filter(node => {
          if (currentLevel === 0) return !node.parent; // Root nodes
          return node.parent === parentId;
        });
        
        // Add each child and its descendants
        children.forEach((child, index) => {
          if (!child || !child.id || !child.label) return;
          
          const isLast = index === children.length - 1;
          visibleNodes.push({ node: child, level: currentLevel, isLast });
          
          // If this node is expanded, add its children recursively
          if (expandedNodes.has(child.id)) {
            buildTreeOrder(child.id, currentLevel + 1);
          }
        });
      };
      
      // Start building from root level
      buildTreeOrder(null, 0);
      
      return visibleNodes;
    } catch (error) {
      console.error('Error building mindmap tree:', error);
      return [];
    }
  };

  // Safe theme handling with fallback
  const theme = mindmapData.theme || {
    backgroundColor: '#ffffff',
    primaryColor: '#007bff',
    textColor: '#333333',
    fontFamily: 'Arial, sans-serif'
  };
  
  // Content-based color system - analyzes the content to determine theme
  const getContentBasedTheme = () => {
    const title = (mindmapData.title || '').toLowerCase();
    const content = JSON.stringify(mindmapData).toLowerCase();
    
    // Detect content type based on keywords
    if (title.includes('history') || title.includes('independence') || title.includes('revolution') || 
        content.includes('century') || content.includes('movement') || content.includes('empire') ||
        /\b(1\d{3}|20\d{2})\b/.test(content)) { // Detects years like 1857, 2023
      return {
        primaryColor: '#9C27B0', // Purple for history
        backgroundColor: '#F3E5F5',
        textColor: '#4A148C',
        levelColors: [
          { bg: '#9C27B0', text: 'white', border: '#9C27B0' }, // Level 0
          { bg: '#E1BEE7', text: '#4A148C', border: '#7B1FA2' }, // Level 1
          { bg: '#F3E5F5', text: '#6A1B9A', border: '#8E24AA' }, // Level 2
          { bg: '#FCE4EC', text: '#880E4F', border: '#AD1457' }, // Level 3
          { bg: '#FFF0F5', text: '#C2185B', border: '#E91E63' }, // Level 4
        ]
      };
    }
    
    if (title.includes('science') || title.includes('physics') || title.includes('chemistry') ||
        content.includes('formula') || content.includes('equation') || content.includes('theory')) {
      return {
        primaryColor: '#2196F3', // Blue for science
        backgroundColor: '#E3F2FD',
        textColor: '#0D47A1',
        levelColors: [
          { bg: '#2196F3', text: 'white', border: '#2196F3' },
          { bg: '#BBDEFB', text: '#0D47A1', border: '#1976D2' },
          { bg: '#E3F2FD', text: '#1565C0', border: '#1E88E5' },
          { bg: '#E8F4FD', text: '#0277BD', border: '#039BE5' },
          { bg: '#F0F8FF', text: '#0288D1', border: '#03A9F4' },
        ]
      };
    }
    
    if (title.includes('story') || title.includes('fable') || title.includes('tale') ||
        content.includes('moral') || content.includes('character') || content.includes('plot')) {
      return {
        primaryColor: '#4CAF50', // Green for stories
        backgroundColor: '#E8F5E8',
        textColor: '#1B5E20',
        levelColors: [
          { bg: '#4CAF50', text: 'white', border: '#4CAF50' },
          { bg: '#C8E6C9', text: '#1B5E20', border: '#388E3C' },
          { bg: '#E8F5E8', text: '#2E7D32', border: '#43A047' },
          { bg: '#F1F8E9', text: '#33691E', border: '#689F38' },
          { bg: '#F9FBE7', text: '#827717', border: '#9E9D24' },
        ]
      };
    }
    
    if (title.includes('math') || title.includes('calculus') || title.includes('algebra') ||
        content.includes('equation') || content.includes('theorem') || content.includes('proof')) {
      return {
        primaryColor: '#009688', // Teal for math
        backgroundColor: '#E0F2F1',
        textColor: '#004D40',
        levelColors: [
          { bg: '#009688', text: 'white', border: '#009688' },
          { bg: '#B2DFDB', text: '#004D40', border: '#00796B' },
          { bg: '#E0F2F1', text: '#00695C', border: '#26A69A' },
          { bg: '#E8F6F3', text: '#00838F', border: '#26C6DA' },
          { bg: '#F0FDFA', text: '#0097A7', border: '#00ACC1' },
        ]
      };
    }
    
    // Default theme if no specific content detected
    return {
      primaryColor: theme.primaryColor || '#007bff',
      backgroundColor: theme.backgroundColor || '#ffffff',
      textColor: theme.textColor || '#333333',
      levelColors: [
        { bg: theme.primaryColor || '#007bff', text: 'white', border: theme.primaryColor || '#007bff' },
        { bg: '#e3f2fd', text: '#1565c0', border: '#1976d2' },
        { bg: '#f3e5f5', text: '#7b1fa2', border: '#8e24aa' },
        { bg: '#e8f5e8', text: '#2e7d32', border: '#388e3c' },
        { bg: '#fff3e0', text: '#ef6c00', border: '#ff9800' },
      ]
    };
  };
  
  const contentTheme = getContentBasedTheme();
  
  // Color system for different hierarchy levels using content-based theme
  const getLevelColors = (level: number) => {
    return contentTheme.levelColors[level] || contentTheme.levelColors[contentTheme.levelColors.length - 1];
  };
  
  const visibleNodes = getVisibleNodes();

  // Handle empty mindmap case
  if (visibleNodes.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>No Mindmap Data</h2>
          <p style={{ margin: '0 0 20px 0', color: '#666' }}>
            No mindmap nodes were found. Please try generating the mindmap again.
          </p>
          <button 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}
    onClick={onClose}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '1000px',
        height: '85%',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: theme.backgroundColor,
        borderBottom: `2px solid ${theme.primaryColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            fontSize: '24px',
            margin: 0
          }}>
            {mindmapData.title || 'Mindmap'}
          </h2>
          <p style={{
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            fontSize: '14px',
            margin: '5px 0 0 0',
            opacity: 0.7
          }}>
            Scroll to zoom • Drag to pan • Click nodes to expand/collapse
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => {
              console.log('Reset button clicked - resetting view'); 
              setExpandedNodes(new Set(['root']));
              setZoom(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: theme.fontFamily,
              fontWeight: 'bold'
            }}
          >
            🔄 Reset View
          </button>
          <button 
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: contentTheme.primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: theme.fontFamily,
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Mindmap Tree Container */}
      <div 
        style={{
          flex: 1,
          overflow: 'hidden', // Change from 'auto' to 'hidden' to prevent scrollbars
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '0 0 20px 20px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0', // Change from 'top left' to '0 0' for better pan behavior
          transition: isDragging ? 'none' : 'transform 0.2s ease',
          maxWidth: '800px',
          margin: '0 auto',
          userSelect: isDragging ? 'none' : 'auto' // Prevent text selection while dragging
        }}>
          
          {visibleNodes.map(({ node, level, isLast }, index) => {
            const isExpanded = expandedNodes.has(node.id);
            const nodeHasChildren = hasChildren(node.id);
            const indentLevel = level * 40;
            
            return (
              <div key={`${node.id}-${level}`} style={{ position: 'relative' }}>
                
                {/* Tree Lines */}
                {level > 0 && (
                  <>
                    {/* Horizontal line to node */}
          <div style={{
                      position: 'absolute',
                      left: `${indentLevel - 20}px`,
                      top: '25px',
                      width: '20px',
                      height: '2px',
                      backgroundColor: theme.primaryColor,
                      opacity: 0.6
                    }} />
                    
                    {/* Vertical line (if not last child) */}
                    {!isLast && (
          <div style={{
                        position: 'absolute',
                        left: `${indentLevel - 20}px`,
                        top: '25px',
                        width: '2px',
                        height: '60px',
                        backgroundColor: theme.primaryColor,
                        opacity: 0.6
                      }} />
                    )}
                  </>
                )}
                
                {/* Node */}
                <div style={{
                  marginLeft: `${indentLevel}px`,
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  
                  {/* Expand/Collapse Button */}
                  {nodeHasChildren && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(node.id, nodeHasChildren);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `2px solid ${theme.primaryColor}`,
                        backgroundColor: isExpanded ? theme.primaryColor : 'white',
                        color: isExpanded ? 'white' : theme.primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '12px',
                        flexShrink: 0
                      }}
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  )}
                  
                  {/* Empty space for nodes without children */}
                  {!nodeHasChildren && level > 0 && (
                  <div style={{
                      width: '24px',
                      height: '24px',
                      marginRight: '12px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: theme.primaryColor,
                        opacity: 0.6
                      }} />
                  </div>
                )}

                  {/* Node Content */}
                  <div
                    style={{ 
                      backgroundColor: getLevelColors(level).bg,
                      color: getLevelColors(level).text,
                      border: `2px solid ${getLevelColors(level).border}`,
                      borderRadius: level === 0 ? '15px' : '10px',
                      padding: level === 0 ? '15px 20px' : '10px 15px',
                      cursor: nodeHasChildren ? 'pointer' : 'default',
                      boxShadow: level === 0 ? '0 6px 16px rgba(0,0,0,0.15)' : '0 3px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      flex: 1,
                      maxWidth: '500px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node.id, nodeHasChildren);
                    }}
                    onMouseEnter={(e) => {
                      if (nodeHasChildren) {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = level === 0 ? '0 8px 20px rgba(0,0,0,0.2)' : '0 5px 12px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (nodeHasChildren) {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = level === 0 ? '0 6px 16px rgba(0,0,0,0.15)' : '0 3px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <h4 style={{
                      color: getLevelColors(level).text,
                      fontFamily: theme.fontFamily,
                      fontSize: level === 0 ? '18px' : level === 1 ? '16px' : '14px',
                      margin: 0,
                      fontWeight: level <= 1 ? 'bold' : 'normal',
                      lineHeight: '1.3'
                    }}>
                      {node.label}
                    </h4>
                    
                    {/* Display description if it exists and is not empty */}
                    {node.description && node.description.trim() !== '' && (
                      <p style={{
                        color: getLevelColors(level).text,
                        fontFamily: theme.fontFamily,
                        fontSize: level === 0 ? '13px' : level === 1 ? '12px' : '11px',
                        margin: '8px 0 0 0',
                        opacity: 0.8,
                        lineHeight: '1.4',
                        fontStyle: 'italic'
                      }}>
                        {node.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}; 

export default MindmapComponent; 