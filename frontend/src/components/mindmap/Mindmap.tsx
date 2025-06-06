import React from 'react';

// Define the MindmapNode interface
export interface MindmapNode {
  id: string;
  text: string;
  children?: MindmapNode[];
}

interface MindmapProps {
  data: {
    nodes: MindmapNode[];
  };
  onNodeClick?: (node: MindmapNode) => void;
}

const Mindmap: React.FC<MindmapProps> = ({ data, onNodeClick }) => {
  // Render a single node
  const renderNode = (node: MindmapNode, level = 0) => {
    const handleClick = () => {
      if (onNodeClick) onNodeClick(node);
    };

    return (
      <div 
        key={node.id}
        onClick={handleClick}
        style={{
          marginLeft: `${level * 20}px`,
          padding: '8px 12px',
          margin: '4px 0',
          backgroundColor: '#2d3748',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          borderLeft: '3px solid #4299e1',
          color: 'white',
          maxWidth: '300px',
        }}
      >
        {node.text}
        {node.children?.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {data.nodes.map((node) => renderNode(node))}
    </div>
  );
};

export default Mindmap;
