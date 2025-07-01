chunking_and_topics_gen_prompt = """Your Role: You are an expert analyst and editor. Your task is to deconstruct and simplify complex text into a clear, concise, and easily digestible format.

Objective: Analyze the provided text below. Your goal is to identify the main topics, clean up the content, and present it in a structured summary.

Instructions:

Analyze the following text and perform these steps:

1. Segment the Text: Read through the entire text and divide it into logical, coherent chunks. The number of chunks should be determined by the natural shifts in topic. Keep the chunks and topics in super high level and between 1 - 3 topics based on the length of the text.
2. For Each Chunk, Process as Follows:
    - Identify a Core Topic: Create a clear and descriptive heading of 3-5 words that accurately reflects the main theme of the chunk.
    - Clean and Refine:
        - Remove any repeated sentences or redundant phrases.
        - Eliminate non-essential special characters (e.g., emojis, artifacts), but retain standard punctuation (periods, commas, etc.) needed for readability.
        - Normalize whitespace by trimming leading/trailing spaces from the chunk and ensuring only a single space between words.
3. Clean the Essence: Clean the content by removing repeated words and removing characters. Preserve most the content only removing the non-essential characters.


Output Format:
Present the final output strictly in the following JSON format. Do not add any introductory or concluding remarks.

JSON

[
  {
    "topic": "[Insert the 3-5 word heading here]",
    "content": "[Insert the summarized and cleaned content for the first chunk here]"
  },
  {
    "topic": "[Insert the 3-5 word heading here]",
    "content": "[Insert the summarized and cleaned content for the second chunk here]"
  },
  // Repeat this structure for every chunk you identify
]
Text to Analyze:
"""