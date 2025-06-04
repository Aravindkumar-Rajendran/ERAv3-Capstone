# Quiz JSON Specification for Backend Integration

This document defines the exact JSON format expected by the frontend quiz components.

## Base Quiz Structure

```json
{
  "subtype": "MCQ" | "TrueFalse" | "FillBlanks" | "MatchFollowing",
  "theme": {
    "primaryColor": "#16213e",
    "secondaryColor": "#0f3460", 
    "backgroundColor": "#1a1a2e",
    "textColor": "#e0dede",
    "fontFamily": "Arial",
    "animation": "slide-in"
  },
  "title": "Quiz Title",
  "description": "Optional quiz description",
  "questions": [...] // Array of question objects based on subtype
}
```

## 1. MCQ (Multiple Choice Questions)

```json
{
  "subtype": "MCQ",
  "theme": { ... },
  "title": "Multiple Choice Quiz",
  "description": "Choose the best answer for each question.",
  "questions": [
    {
      "id": 1,
      "question": "What is the capital of Japan?",
      "options": ["Seoul", "Tokyo", "Beijing", "Bangkok"],
      "correctAnswer": 1,
      "explanation": "Tokyo is the capital and largest city of Japan."
    }
  ]
}
```

### MCQ Features:
- **No hint button** for MCQ type
- **First attempt**: 1 point if correct, 0.5 if wrong then correct
- **Wrong answer**: Show hint message, allow retry
- **Scoring**: 1 point (first correct) | 0.5 (second correct) | 0 (wrong)

## 2. TrueFalse

```json
{
  "subtype": "TrueFalse", 
  "theme": { ... },
  "title": "True or False Quiz",
  "description": "Determine whether each statement is true or false.",
  "questions": [
    {
      "id": 1,
      "statement": "The Earth is the third planet from the Sun.",
      "correctAnswer": true,
      "hint": "Think about the order: Mercury, Venus, then what?",
      "explanation": "Yes, Earth is the third planet from the Sun after Mercury and Venus."
    }
  ]
}
```

### TrueFalse Features:
- **Hint button available** before answering
- **Scoring**: 1 point (no hint) | 0.5 (with hint) | 0 (wrong)
- **Always show explanation** after answering

## 3. FillBlanks

```json
{
  "subtype": "FillBlanks",
  "theme": { ... },
  "title": "Fill in the Blanks",
  "description": "Complete each sentence by filling in the missing word.",
  "questions": [
    {
      "id": 1,
      "sentence": "The first man to walk on the moon was Neil [BLANK].",
      "correctAnswers": ["Armstrong"],
      "hint": "His last name is also a word meaning strong arm.",
      "explanation": "Neil Armstrong was the first person to walk on the moon in 1969."
    }
  ]
}
```

### FillBlanks Features:
- **Hint button available** before submitting
- **Multiple correct answers** supported in array
- **Case-insensitive validation**
- **Flexible input**: Handles capitals, lowercase, numbers vs words
- **Scoring**: 1 point (no hint) | 0.5 (with hint) | 0 (wrong)

## 4. MatchFollowing

```json
{
  "subtype": "MatchFollowing",
  "theme": { ... }, 
  "title": "Match the Following",
  "description": "Match items from the left column with their corresponding items on the right.",
  "questions": [
    {
      "id": 1,
      "instruction": "Match each person/place with their correct category:",
      "pairs": [
        { "id": 1, "left": "Shakespeare", "right": "Writer" },
        { "id": 2, "left": "Paris", "right": "Capital" },
        { "id": 3, "left": "Einstein", "right": "Scientist" },
        { "id": 4, "left": "Piano", "right": "Instrument" },
        { "id": 5, "left": "Pacific", "right": "Ocean" }
      ]
    }
  ]
}
```

### MatchFollowing Features:
- **Click-to-pair system**: Left item → Right item → Lock both
- **Fixed positions**: Options don't shuffle/reorder
- **Any order pairing**: Can match questions in any sequence
- **Submit button**: Appears when all pairs matched
- **Scoring**: 1 point (correct) | 0 (wrong) - No 0.5 points
- **Results**: Shows wrong selection + correct answer
- **Retry option** available

## Important Notes for Backend:

1. **Always include 5 questions** per quiz
2. **IDs must be unique** within each question array
3. **CorrectAnswer indices** are 0-based for MCQ
4. **Theme colors** can be customized but should maintain contrast
5. **Explanations are required** for proper feedback
6. **Hints are optional** except for TrueFalse and FillBlanks where they're expected

## Validation Rules:

### MCQ:
- `correctAnswer` must be valid index (0-3 for 4 options)
- Minimum 2 options, maximum 4 options recommended

### TrueFalse:
- `correctAnswer` must be boolean
- `hint` and `explanation` should be provided

### FillBlanks:
- Use `[BLANK]` placeholder in sentence
- `correctAnswers` array supports multiple valid answers
- Frontend handles case-insensitive matching

### MatchFollowing:
- Each pair needs unique `id`
- `left` and `right` should be concise (under 50 characters)
- Pairs array should contain exactly 5 items

This specification ensures smooth integration between LLM-generated content and the frontend quiz components. 