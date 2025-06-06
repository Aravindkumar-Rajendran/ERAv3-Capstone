## Timeline Format

```json
{
  "id": "unique-timeline-id",
  "title": "World War II Events",
  "description": "Major events of World War II",
  "theme": {
    "primaryColor": "#9C27B0",
    "backgroundColor": "#F3E5F5",
    "textColor": "#4A148C",
    "fontFamily": "Arial, sans-serif"
  },
  "events": [
    {
      "id": 1,
      "title": "Invasion of Poland",
      "date": "1939-09-01",
      "endDate": "1939-10-06",
      "description": "Germany invades Poland, marking the start of World War II",
      "category": "military",
      "importance": "high",
      "media": {
        "type": "image",
        "url": "path/to/image.jpg",
        "caption": "German troops at the Polish border"
      }
    },
    {
      "id": 2,
      "title": "Attack on Pearl Harbor",
      "date": "1941-12-07",
      "description": "Japanese attack brings the United States into the war",
      "category": "military",
      "importance": "high"
    }
  ],
  "eras": [
    {
      "name": "European Theater",
      "startDate": "1939-09-01",
      "startYear": 1939,
      "endDate": "1945-05-08",
      "endYear": 1945
    },
    {
      "name": "Pacific Theater",
      "startDate": "1941-12-07",
      "startYear": 1941,
      "endDate": "1945-09-02",
      "endYear": 1945
    }
  ],
  "createdAt": "2025-06-05T17:51:00Z",
  "lastModified": "2025-06-05T17:51:00Z"
}
```