import io
from fastapi import UploadFile
import PyPDF2

async def extract_text_from_pdf(file: UploadFile) -> str:
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
        
        # Limit text length to avoid token limits (roughly 15,000 characters)
        if len(extracted_text) > 15000:
            extracted_text = extracted_text[:15000] + "..."
        
        return extracted_text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_extracted_text(text: str) -> str:
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