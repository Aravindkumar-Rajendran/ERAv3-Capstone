import os
import json
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    def __init__(self):
        """Initialize Gemini 2.0 Flash client"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
    
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
    
    async def generate_flashcards(self, content: str, prompt_template: str) -> Dict[Any, Any]:
        """
        Generate flashcards using Gemini 2.0 Flash
        
        Args:
            content: User provided content (text from input or PDF)
            prompt_template: Comprehensive prompt with instructions and examples
            
        Returns:
            Dict: Complete flashcard JSON with theme and cards
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
            flashcard_data = json.loads(response_text)
            
            # Validate required fields
            self._validate_flashcard_structure(flashcard_data)
            
            return flashcard_data
            
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from Gemini: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate flashcards: {str(e)}")
    
    def _validate_flashcard_structure(self, flashcard_data: Dict[Any, Any]) -> None:
        """Validate that the flashcard has required structure"""
        
        required_fields = ["id", "title", "theme", "cards"]
        for field in required_fields:
            if field not in flashcard_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate cards array
        if not isinstance(flashcard_data["cards"], list):
            raise ValueError("Cards must be an array")
        
        if len(flashcard_data["cards"]) < 1:
            raise ValueError("Flashcard deck must contain at least 1 card")
        
        # Validate each card structure
        for i, card in enumerate(flashcard_data["cards"]):
            required_card_fields = ["id", "front", "back", "difficulty", "tags"]
            for field in required_card_fields:
                if field not in card:
                    raise ValueError(f"Missing card field '{field}' in card {i+1}")
        
        # Validate theme structure
        theme = flashcard_data.get("theme", {})
        required_theme_fields = ["primaryColor", "backgroundColor", "textColor"]
        for field in required_theme_fields:
            if field not in theme:
                raise ValueError(f"Missing theme field: {field}")
    
    async def generate_timeline(self, content: str, prompt_template: str) -> Dict[Any, Any]:
        """
        Generate timeline using Gemini 2.0 Flash
        
        Args:
            content: User provided content (text from input or PDF)
            prompt_template: Comprehensive prompt with instructions and examples
            
        Returns:
            Dict: Complete timeline JSON with events and eras
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
            timeline_data = json.loads(response_text)
            
            # Validate required fields
            self._validate_timeline_structure(timeline_data)
            
            return timeline_data
            
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from Gemini: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate timeline: {str(e)}")
    
    def _validate_timeline_structure(self, timeline_data: Dict[Any, Any]) -> None:
        """Validate that the timeline has required structure"""
        
        required_fields = ["id", "title", "theme", "events"]
        for field in required_fields:
            if field not in timeline_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate events array
        if not isinstance(timeline_data["events"], list):
            raise ValueError("Events must be an array")
        
        if len(timeline_data["events"]) < 1:
            raise ValueError("Timeline must contain at least 1 event")
        
        # Validate each event structure
        for i, event in enumerate(timeline_data["events"]):
            required_event_fields = ["id", "title", "date", "description", "category", "importance"]
            for field in required_event_fields:
                if field not in event:
                    raise ValueError(f"Missing event field '{field}' in event {i+1}")
        
        # Validate theme structure
        theme = timeline_data.get("theme", {})
        required_theme_fields = ["primaryColor", "backgroundColor", "textColor"]
        for field in required_theme_fields:
            if field not in theme:
                raise ValueError(f"Missing theme field: {field}")
    
    async def generate_mindmap(self, content: str, prompt_template: str) -> Dict[Any, Any]:
        """
        Generate mindmap using Gemini 2.0 Flash
        
        Args:
            content: User provided content (text from input or PDF)
            prompt_template: Comprehensive prompt with instructions and examples
            
        Returns:
            Dict: Complete mindmap JSON with nodes and relationships
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
            mindmap_data = json.loads(response_text)
            
            # Validate required fields
            self._validate_mindmap_structure(mindmap_data)
            
            return mindmap_data
            
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from Gemini: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate mindmap: {str(e)}")
    
    def _validate_mindmap_structure(self, mindmap_data: Dict[Any, Any]) -> None:
        """Validate that the mindmap has required structure"""
        
        required_fields = ["id", "title", "theme", "nodes"]
        for field in required_fields:
            if field not in mindmap_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate nodes array
        if not isinstance(mindmap_data["nodes"], list):
            raise ValueError("Nodes must be an array")
        
        if len(mindmap_data["nodes"]) < 1:
            raise ValueError("Mindmap must contain at least 1 node")
        
        # Helper function to validate node recursively
        def validate_node_recursive(node, path=""):
            required_node_fields = ["id", "label", "type"]
            for field in required_node_fields:
                if field not in node:
                    raise ValueError(f"Missing node field '{field}' in node at {path}")
            
            # If node has children, validate them recursively
            if "children" in node and node["children"] is not None:
                if not isinstance(node["children"], list):
                    raise ValueError(f"Node children must be an array at {path}")
                
                for i, child in enumerate(node["children"]):
                    validate_node_recursive(child, f"{path}.children[{i}]")
        
        # Validate each top-level node and its children
        for i, node in enumerate(mindmap_data["nodes"]):
            validate_node_recursive(node, f"nodes[{i}]")
        
        # Validate theme structure
        theme = mindmap_data.get("theme", {})
        required_theme_fields = ["primaryColor", "backgroundColor", "textColor"]
        for field in required_theme_fields:
            if field not in theme:
                raise ValueError(f"Missing theme field: {field}")