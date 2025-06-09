import React, { useState } from 'react';
import { MindmapComponentProps, MindmapNode } from '../../types/mindmap';

export const MindmapComponent = ({ 
  mindmapData, 
  isOpen, 
  onClose, 
  onComplete 
}: MindmapComponentProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const getAllNodes = (nodes: MindmapNode[]): MindmapNode[] => {
    let allNodes: MindmapNode[] = [];
    const traverse = (nodeList: MindmapNode[]) => {
      nodeList.forEach(node => {
        allNodes.push(node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return allNodes;
  };

  const findNodeById = (nodes: MindmapNode[], id: string): MindmapNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
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

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  const selectedNode = findNodeById(mindmapData.nodes, selectedNodeId);
  const allNodes = getAllNodes(mindmapData.nodes);
  const totalNodes = allNodes.length;
  const exploredNodes = expandedNodes.size;

  const renderNode = (node: MindmapNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} style={{ marginLeft: `${level * 30}px`, marginBottom: '10px' }}>
        <div
          onClick={() => selectNode(node.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: isSelected 
              ? `${mindmapData.theme.primaryColor}40` 
              : 'rgba(255,255,255,0.1)',
            border: isSelected 
              ? `2px solid ${mindmapData.theme.primaryColor}` 
              : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            maxWidth: '300px'
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                marginRight: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: mindmapData.theme.primaryColor
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <div style={{
            fontSize: node.type === 'root' ? '16px' : '14px',
            fontWeight: node.type === 'root' ? 'bold' : 'normal',
            color: mindmapData.theme.textColor
          }}>
            {node.type === 'root' ? '🧠' : '💡'} {node.label}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div style={{ marginTop: '5px' }}>
            {node.children?.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mindmap-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="mindmap-modal" style={{
        backgroundColor: mindmapData.theme.backgroundColor,
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '1000px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        width: '95%',
        color: mindmapData.theme.textColor,
        fontFamily: mindmapData.theme.fontFamily
      }}>
        <button 
          className="close-button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: mindmapData.theme.textColor
          }}
        >
          ×
        </button>

        {/* Completion Screen */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🧠</div>
              <h2 style={{ fontSize: '32px', marginBottom: '15px', color: mindmapData.theme.primaryColor }}>
                Mindmap Explored!
              </h2>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                You've explored the knowledge structure!
              </p>
              <p style={{ fontSize: '16px', marginBottom: '30px', opacity: 0.8 }}>
                Nodes explored: {exploredNodes} / {totalNodes}
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setSelectedNodeId('root');
                    setExpandedNodes(new Set(['root']));
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🔄 Reset
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: `linear-gradient(45deg, ${mindmapData.theme.primaryColor}, #66bb6a)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🏠 Return Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '28px', 
            background: `linear-gradient(45deg, ${mindmapData.theme.primaryColor}, #66bb6a)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
          }}>
            🧠 {mindmapData.title}
          </h2>
          {mindmapData.description && (
            <p style={{ margin: '10px 0', opacity: 0.8 }}>{mindmapData.description}</p>
          )}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
            <div style={{ fontSize: '16px' }}>
              Nodes explored: {exploredNodes} / {totalNodes}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          height: '8px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: `linear-gradient(45deg, ${mindmapData.theme.primaryColor}, #66bb6a)`,
            height: '100%',
            width: `${(exploredNodes / totalNodes) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '30px', minHeight: '400px' }}>
          {/* Left Panel - Tree View */}
          <div style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '20px',
            border: `2px solid ${mindmapData.theme.primaryColor}40`,
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '20px',
              color: mindmapData.theme.primaryColor,
              fontSize: '18px'
            }}>
              📋 Knowledge Structure
            </h3>
            {mindmapData.nodes.map(node => renderNode(node))}
          </div>

          {/* Right Panel - Selected Node Details */}
          <div style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '20px',
            border: `2px solid ${mindmapData.theme.primaryColor}40`
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '20px',
              color: mindmapData.theme.primaryColor,
              fontSize: '18px'
            }}>
              🔍 Node Details
            </h3>
            
            {selectedNode && (
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  color: mindmapData.theme.textColor
                }}>
                  {selectedNode.type === 'root' ? '🧠' : '💡'} {selectedNode.label}
                </div>
                
                <div style={{
                  backgroundColor: selectedNode.type === 'root' 
                    ? `${mindmapData.theme.primaryColor}20` 
                    : 'rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <strong>Type:</strong> {selectedNode.type === 'root' ? 'Root Concept' : 'Sub-concept'}
                </div>

                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div>
                    <strong style={{ color: mindmapData.theme.primaryColor }}>
                      Connected concepts:
                    </strong>
                    <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                      {selectedNode.children.map(child => (
                        <li 
                          key={child.id} 
                          style={{ 
                            marginBottom: '5px',
                            cursor: 'pointer',
                            color: mindmapData.theme.textColor,
                            opacity: 0.8
                          }}
                          onClick={() => selectNode(child.id)}
                        >
                          💡 {child.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Show connections */}
                {mindmapData.connections.some(conn => conn.from === selectedNodeId || conn.to === selectedNodeId) && (
                  <div style={{ marginTop: '20px' }}>
                    <strong style={{ color: mindmapData.theme.primaryColor }}>
                      Relationships:
                    </strong>
                    <div style={{ marginTop: '10px' }}>
                      {mindmapData.connections
                        .filter(conn => conn.from === selectedNodeId || conn.to === selectedNodeId)
                        .map((conn, index) => (
                          <div key={index} style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: '8px',
                            borderRadius: '5px',
                            marginBottom: '5px',
                            fontSize: '14px'
                          }}>
                            {conn.from === selectedNodeId 
                              ? `→ ${conn.label} → ${findNodeById(mindmapData.nodes, conn.to)?.label}`
                              : `← ${conn.label} ← ${findNodeById(mindmapData.nodes, conn.from)?.label}`
                            }
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={() => {
              const allExpanded = new Set(allNodes.map(n => n.id));
              setExpandedNodes(allExpanded);
            }}
            style={{
              background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              minWidth: '130px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🔍 Expand All
          </button>

          <button
            onClick={handleComplete}
            style={{
              background: `linear-gradient(45deg, ${mindmapData.theme.primaryColor}, #66bb6a)`,
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              minWidth: '110px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ✅ Complete
          </button>
        </div>
      </div>
    </div>
  );
}; 