import os
import json
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv
from prompts.socratic_chat import SOCRATIC_CHAT_PROMPT

load_dotenv()

class GeminiClient:
    def __init__(self):
        """Initialize Gemini 2.0 Flash client"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

    def chat(self, user_input: str, context: list) -> str:
        """
        Generate a Socratic response from Gemini 2.0 Flash model
        
        Args:
            user_input: User's input text
            context: Retrieved context from the vector store
            
        Returns:
            str: Generated Socratic response text
        """
        user_input = user_input.strip()
        
        if context:
            prompt = f"{SOCRATIC_CHAT_PROMPT}\n\nCONTEXT (use this to inform your questions and examples, referencing the student's uploaded materials):\n{context}\n\nSTUDENT QUESTION:\n{user_input}\n\nYour Socratic Response:"
        else:
            prompt = f"{SOCRATIC_CHAT_PROMPT}\n\nSTUDENT QUESTION:\n{user_input}\n\nYour Socratic Response:"

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")
        
    def generate(self, prompt: str) -> str:
        """
        Generate content using Gemini 2.0 Flash model
        
        Args:
            prompt: The prompt to generate content from
            
        Returns:
            str: Generated content text
        """
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Failed to generate content: {str(e)}")
        
    async def generate_chunk_and_topics(self, content: str, prompt_template: str) -> str:
        """
        Generate chunks and topics using Gemini 2.0 Flash
        
        Args:
            content: User provided content (text from input or PDF)
            prompt_template: Comprehensive prompt with instructions and examples
            
        Returns:
            str: JSON string with topics and cleaned content
        """
        
        try:
            # Combine prompt template with user content
            full_prompt = f"{prompt_template}\n{content}"
            
            # Generate response using Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )
            # Extract JSON from response
            response_text = response.text.strip()
            # Clean response text - remove any markdown code blocks
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            elif "```" in response_text:
                start = response_text.find("```") + 3
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            
            # Validate JSON format
            try:
                response = json.loads(response_text)
                return response
            
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON response from Gemini: {str(e)}")
            
        except Exception as e:
            raise Exception(f"Failed to generate chunks and topics: {str(e)}")

    
    async def generate_quiz(self, content: str, prompt_template: str) -> Dict[Any, Any]:
        """
        Generate quiz using Gemini 2.0 Flash
        
        Args:
            content: User provided content (text from input or PDF)
            prompt_template: Comprehensive prompt with instructions and examples
            
        Returns:
            Dict: Complete quiz JSON with subtype, theme, and questions
        """
        
        try:
            # Combine prompt template with user content
            full_prompt = f"{prompt_template}\n\nCONTENT TO ANALYZE:\n{content}"
            
            # Generate response using Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_k=40,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )
            
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Clean response text - remove any markdown code blocks
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            elif "```" in response_text:
                start = response_text.find("```") + 3
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            
            # Parse JSON response
            quiz_data = json.loads(response_text)
            
            # Validate required fields
            self._validate_quiz_structure(quiz_data)
            
            return quiz_data
            
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from Gemini: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate quiz: {str(e)}")
    
    def _validate_quiz_structure(self, quiz_data: Dict[Any, Any]) -> None:
        """Validate that the quiz has required structure"""
        
        required_fields = ["subtype", "theme", "title", "questions"]
        for field in required_fields:
            if field not in quiz_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate subtype
        valid_subtypes = ["MCQ", "TrueFalse", "FillBlanks", "MatchFollowing"]
        if quiz_data["subtype"] not in valid_subtypes:
            raise ValueError(f"Invalid subtype: {quiz_data['subtype']}")
        
        # Validate questions array
        if not isinstance(quiz_data["questions"], list):
            raise ValueError("Questions must be an array")
        
        if len(quiz_data["questions"]) < 1:
            raise ValueError("Quiz must contain at least 1 question")
        
        # Validate theme structure
        theme = quiz_data.get("theme", {})
        required_theme_fields = ["primaryColor", "secondaryColor", "backgroundColor", "textColor"]
        for field in required_theme_fields:
            if field not in theme:
                raise ValueError(f"Missing theme field: {field}") 