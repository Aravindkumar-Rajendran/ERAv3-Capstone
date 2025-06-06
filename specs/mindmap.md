## Mindmap Format

```json
{
  "id": "unique-mindmap-id",
  "title": "Biology Concepts",
  "description": "Mindmap of key biology concepts",
  "theme": {
    "primaryColor": "#2196F3",
    "backgroundColor": "#E3F2FD",
    "textColor": "#0D47A1",
    "fontFamily": "Arial, sans-serif"
  },
  "nodes": [
    {
      "id": "root",
      "label": "Biology",
      "type": "root",
      "children": [
        {
          "id": "cell",
          "label": "Cell Structure",
          "type": "concept",
          "children": [
            {"id": "nucleus", "label": "Nucleus", "type": "concept"},
            {"id": "mitochondria", "label": "Mitochondria", "type": "concept"}
          ]
        },
        {
          "id": "genetics",
          "label": "Genetics",
          "type": "concept",
          "children": [
            {"id": "dna", "label": "DNA", "type": "concept"},
            {"id": "rna", "label": "RNA", "type": "concept"}
          ]
        }
      ]
    }
  ],
  "connections": [
    {"from": "nucleus", "to": "dna", "label": "contains"},
    {"from": "dna", "to": "rna", "label": "transcribes to"}
  ],
  "createdAt": "2025-06-05T17:51:00Z",
  "lastModified": "2025-06-05T17:51:00Z"
}

```