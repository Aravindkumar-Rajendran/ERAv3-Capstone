import uuid
import chromadb
from chromadb.config import Settings

class Indexer:
    """
    Handles indexing of chunks and topics into ChromaDB.
    """
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = "whizardlm_chunks"
        if self.collection_name not in [c.name for c in self.client.list_collections()]:
            self.collection = self.client.create_collection(self.collection_name)
        else:
            self.collection = self.client.get_collection(self.collection_name)

    def get_conversation_id(self):
        """Generate a unique conversation ID (can be replaced with a more robust method)."""
        return str(uuid.uuid4())

    def create_index_with_topics(self, conversation_id, chunks, topics, project_id=None):
        """
        Indexes the chunks and topics into ChromaDB with a conversation ID and project ID.
        """
        documents = []
        metadatas = []
        ids = []
        for idx, (chunk, topic) in enumerate(zip(chunks, topics)):
            documents.append(chunk)
            metadata = {
                "conversation_id": conversation_id,
                "topic": topic
            }
            # Add project_id if provided for proper project isolation
            if project_id:
                metadata["project_id"] = project_id
            
            metadatas.append(metadata)
            ids.append(f"{conversation_id}_{idx}")
        
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        return True

class Retriever:
    """
    Retrieves relevant chunks from ChromaDB by semantic search or by topic.
    """
    def __init__(self, conversation_id=None, project_id=None, persist_directory: str = "./chroma_db"):
        self.conversation_id = conversation_id
        self.project_id = project_id
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = "whizardlm_chunks"
        self.collection = self.client.get_collection(self.collection_name)

    def semantic_search(self, query, n_results=5):
        """
        Retrieve the most relevant chunks for a query using ChromaDB's query API.
        Now properly filters by project_id when provided.
        """
        print("all item in collections:", self.collection.get())
        
        # Build where clause for filtering
        where_clause = {}
        
        # Filter by conversation_id if provided
        if self.conversation_id:
            where_clause["conversation_id"] = self.conversation_id
        
        # Filter by project_id if provided (for project-level isolation)
        if self.project_id:
            where_clause["project_id"] = self.project_id
        
        # Execute query with appropriate filtering
        if where_clause:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_clause
            )
        else:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
        
        print(f"Search results: {results}")
        # Return the matched documents (chunks)
        return results.get("documents", [[]])[0]

    def retrieve_content_with_topics(self, topics):
        """
        Retrieve all chunks for the given topics for this conversation.
        """
        # Build where clause for filtering
        where_clause = {}
        
        if self.conversation_id:
            where_clause["conversation_id"] = self.conversation_id
        
        if self.project_id:
            where_clause["project_id"] = self.project_id
        
        # Fetch documents with appropriate filtering
        if where_clause:
            results = self.collection.get(where=where_clause)
        else:
            results = self.collection.get()
        
        all_chunks = []
        metadatas = results.get("metadatas", [])
        documents = results.get("documents", [])
        for metadata, doc in zip(metadatas, documents):
            if metadata.get("topic") in topics:
                all_chunks.append(doc)
        return all_chunks

    def retrieve_content_by_project(self, project_id, topics):
        """
        Retrieve content for a specific project by topics.
        Now properly filters by project_id for true project isolation.
        """
        # Filter by project_id first, then by topics
        where_clause = {"project_id": project_id} if project_id else {}
        
        if where_clause:
            results = self.collection.get(where=where_clause)
        else:
            results = self.collection.get()
        
        all_chunks = []
        metadatas = results.get("metadatas", [])
        documents = results.get("documents", [])
        
        for metadata, doc in zip(metadatas, documents):
            if metadata.get("topic") in topics:
                all_chunks.append(doc)
        
        return all_chunks


