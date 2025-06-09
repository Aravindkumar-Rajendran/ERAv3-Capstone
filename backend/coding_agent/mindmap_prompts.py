COMPREHENSIVE_MINDMAP_PROMPT = """You are an expert educational content creator for an educational AI platform. Analyze the provided content and create a hierarchical mindmap for effective learning and knowledge organization.

## EXACT JSON FORMAT REQUIRED:

```json
{
  "id": "unique-mindmap-id",
  "title": "[Title based on content]",
  "description": "[Description based on content]",
  "theme": {
    "primaryColor": "#2196F3",
    "backgroundColor": "#E3F2FD",
    "textColor": "#0D47A1",
    "fontFamily": "Arial, sans-serif"
  },
  "nodes": [
    {
      "id": "root",
      "label": "[Main topic from content]",
      "type": "root",
      "children": [
        {
          "id": "concept1",
          "label": "[Sub-concept from content]",
          "type": "concept",
          "children": [
            {"id": "detail1", "label": "[Specific detail]", "type": "concept"}
          ]
        }
      ]
    }
  ],
  "connections": [
    {"from": "concept1", "to": "detail1", "label": "contains"},
    {"from": "detail1", "to": "concept2", "label": "relates to"}
  ],
  "createdAt": "2025-01-14T12:00:00Z",
  "lastModified": "2025-01-14T12:00:00Z"
}
```

## REQUIREMENTS:
1. **EXACTLY 15-25 total nodes** (including root and all children)
2. Generate nodes from the actual content provided
3. Use the exact JSON structure shown above - NO description field in nodes
4. **IMPORTANT: Choose appropriate colors based on content:**
   - Science/Technology: Blue themes (#2196F3, #1976D2, #0D47A1)
   - Biology/Medicine: Green themes (#4CAF50, #388E3C, #2E7D32)
   - History/Social Studies: Purple themes (#9C27B0, #7B1FA2, #4A148C)
   - Literature/Languages: Orange themes (#FF9800, #F57C00, #E65100)
   - Mathematics: Teal themes (#009688, #00796B, #004D40)
   - **AI should analyze content and choose the most fitting color scheme**

5. **Node Structure Guidelines:**
   - **Root**: Main central concept (only 1)
   - **Level 1**: Major sub-topics (3-5 nodes)
   - **Level 2**: Specific concepts (2-4 children per Level 1)
   - **Level 3**: Details/examples (1-3 children per Level 2)
   - **Maximum depth**: 3 levels below root

6. **Connection Guidelines:**
   - Create logical relationships between nodes
   - Use descriptive labels: "contains", "leads to", "causes", "includes", "relates to"
   - Focus on cross-references between different branches
   - 5-10 connections recommended

7. **Mindmap Principles:**
   - Hierarchical organization from general to specific
   - Clear parent-child relationships
   - Logical grouping of related concepts
   - Balance across different branches
   - Use concise, descriptive labels

## CONNECTION LABEL EXAMPLES:
- "contains" - parent encompasses child
- "leads to" - causal or sequential relationship
- "includes" - part-of relationship
- "causes" - direct causation
- "relates to" - general association
- "produces" - creation/generation
- "defines" - definition relationship

## OUTPUT:
Return ONLY the JSON. Do not add any text before or after.
""" 