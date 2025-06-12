COMPREHENSIVE_MINDMAP_PROMPT = """You are an expert educational content creator for an educational AI platform. Analyze the provided content and create a detailed hierarchical mindmap for effective learning and knowledge organization.

## EXACT JSON FORMAT REQUIRED:

```json
{
  "id": "unique-mindmap-id",
  "title": "[Title based on content]",
  "description": "[Detailed description based on content - what this mindmap covers]",
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
      "description": "[Detailed explanation of the main topic]",
      "children": [
        {
          "id": "concept1",
          "label": "[Sub-concept from content]",
          "type": "concept",
          "description": "[Detailed explanation of this sub-concept]",
          "children": [
            {
              "id": "detail1", 
              "label": "[Specific detail]", 
              "type": "concept",
              "description": "[Detailed explanation of this specific detail]",
              "children": [
                {
                  "id": "example1",
                  "label": "[Example/case study]",
                  "type": "concept", 
                  "description": "[Detailed explanation of this example]"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "connections": [
    {"from": "concept1", "to": "detail1", "label": "encompasses"},
    {"from": "detail1", "to": "concept2", "label": "influences"},
    {"from": "example1", "to": "concept3", "label": "demonstrates"}
  ],
  "createdAt": "2025-01-14T12:00:00Z",
  "lastModified": "2025-01-14T12:00:00Z"
}
```

## REQUIREMENTS:
1. **EXACTLY 18-25 total nodes** (including root and all children)
2. Generate ALL nodes from the actual content provided - extract specific details, examples, processes, concepts
3. **CRITICAL: Add 'description' field to EVERY node** with detailed explanations from the content
4. **IMPORTANT: Choose appropriate colors based on content:**
   - Science/Technology: Blue themes (#2196F3, #1976D2, #0D47A1)
   - Biology/Medicine: Green themes (#4CAF50, #388E3C, #2E7D32)
   - History/Social Studies: Purple themes (#9C27B0, #7B1FA2, #4A148C)
   - Literature/Languages: Orange themes (#FF9800, #F57C00, #E65100)
   - Mathematics: Teal themes (#009688, #00796B, #004D40)
   - Business/Economics: Orange themes (#FF9800, #F57C00, #E65100)

5. **Enhanced Node Structure Guidelines:**
   - **Root**: Main central concept (only 1) - with comprehensive description
   - **Level 1**: Major sub-topics (4-6 nodes) - each with detailed descriptions
   - **Level 2**: Specific concepts (3-4 children per Level 1) - with explanations
   - **Level 3**: Details/examples (2-3 children per Level 2) - with specific descriptions
   - **Level 4**: Sub-details/cases (1-2 children per Level 3) - with concrete examples
   - **Maximum depth**: 4 levels below root for rich hierarchy

6. **Enhanced Connection Guidelines:**
   - Create 8-15 meaningful cross-connections between branches
   - Use specific, descriptive labels from the content context
   - Focus on cause-effect, dependency, and conceptual relationships
   - Connect nodes across different branches, not just parent-child

7. **Rich Content Extraction:**
   - Extract specific facts, figures, examples from content
   - Include processes, methods, techniques as separate nodes
   - Add key terms, definitions, and concepts as detailed nodes
   - Include case studies, examples, applications as leaf nodes

## ENHANCED CONNECTION LABEL EXAMPLES:
- "encompasses" - broader concept includes narrower one
- "influences" - one concept affects another
- "demonstrates" - example shows principle
- "requires" - dependency relationship
- "produces" - causal creation
- "contrasts with" - opposing concepts
- "builds upon" - progressive relationship
- "implements" - practical application
- "measures" - quantification relationship
- "analyzes" - examination relationship

## DESCRIPTION GUIDELINES:
- **Root description**: 2-3 sentences explaining the overall topic scope
- **Level 1 descriptions**: 1-2 sentences explaining the sub-topic significance
- **Level 2+ descriptions**: 1 sentence with specific details from content
- Use actual facts, data, examples from the provided content
- Make descriptions educational and informative

## VALIDATION REQUIREMENTS:
- Minimum 18 nodes total (count carefully)
- Every node MUST have a description field
- At least 4 Level 1 children under root
- At least 8 cross-connections between different branches
- Descriptions must contain actual content information, not generic text

## OUTPUT:
Return ONLY the JSON. Do not add any text before or after.
""" 