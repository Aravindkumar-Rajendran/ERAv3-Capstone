import io
from fastapi import UploadFile
import PyPDF2
from youtube_transcript_api import YouTubeTranscriptApi

from prompts.chunk_n_topics import chunking_and_topics_gen_prompt
from utils.gemini_client import GeminiClient

client = GeminiClient()


ytt_api = YouTubeTranscriptApi()

class Extractor:
    """
    Utility class for extracting text from various file types.
    Currently supports PDF files.
    """
    
    def __init__(self):
        pass

    def clean_extracted_text(self, text: str) -> str:
        """
        Clean and format extracted text for better processing
        
        Args:
            text: Raw extracted text
            
        Returns:
            str: Cleaned text
        """
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Remove common PDF artifacts
        text = text.replace('\x00', '')  # Remove null characters
        text = text.replace('\ufffd', '')  # Remove replacement characters
        
        return text 

    async def extract_text_from_pdf(self, file: UploadFile) -> str:
        """
        Extract text content from uploaded PDF file
        
        Args:
            file: UploadFile object containing PDF data
            
        Returns:
            str: Extracted text content from PDF
        """
        try:
            # Read file content
            pdf_content = await file.read()
            
            # Create PDF reader from bytes
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            
            # Extract text from all pages
            extracted_text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                extracted_text += page.extract_text() + "\n"
            
            # Clean and validate extracted text
            extracted_text = extracted_text.strip()
            
            if not extracted_text:
                raise ValueError("No text could be extracted from the PDF")
                return ""
            
            return self.clean_extracted_text(extracted_text)
            
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    async def extract_transcripts_from_youtube(self, youtube_urls: str) -> list:
        """
        Extract transcripts from provided YouTube URLs

        Args:
            youtube_urls: Comma-separated string of YouTube video URLs

        Returns:
            list: List of extracted transcripts from YouTube videos
        """

        chunks = []
        for url in youtube_urls:
            if "youtube.com/watch?v=" in url or "youtu.be/" in url:
                video_id = url.split("v=")[-1].split("&")[0] if "v=" in url else url.split("/")[-1]
                # Fetch YouTube transcript
                transcript = ytt_api.fetch(video_id)
                content = " ".join([item['text'] for item in transcript.snippets])
                chunks.append(content)

        return chunks

class Chunker:
    """
    Splits content into smaller chunks and assigns topics to each chunk.
    """
    def __init__(self, chunk_size: int = 500):
        self.chunk_size = chunk_size

    def chunk_with_topics(self, contents):
        """
        Splits each content string into chunks and assigns a dummy topic for each chunk.
        Returns a tuple: (chunks, topics)
        """
        chunks = []
        topics = []
        for content in contents:
            response = client.generate_chunk_and_topics(content, chunking_and_topics_gen_prompt)
            for item in response:
                topic = item.get("topic")
                content = item.get("content", "")
                content = content.strip()
                if content:
                    chunks.append(content)
                    topics.append(topic)

        return chunks, topics