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

    def create_index_with_topics(self, conversation_id, chunks, topics):
        """
        Indexes the chunks and topics into ChromaDB with a conversation ID.
        """
        documents = []
        metadatas = []
        ids = []
        for idx, (chunk, topic) in enumerate(zip(chunks, topics)):
            documents.append(chunk)
            metadatas.append({
                "conversation_id": conversation_id,
                "topic": topic
            })
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
    def __init__(self, conversation_id, persist_directory: str = "./chroma_db"):
        self.conversation_id = conversation_id
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = "whizardlm_chunks"
        self.collection = self.client.get_collection(self.collection_name)

    def semantic_search(self, query, n_results=5):
        """
        Retrieve the most relevant chunks for a query using ChromaDB's query API.
        """
        print("all item in collections:", self.collection.get())
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"conversation_id": self.conversation_id}
        )
        print(f"Search results: {results}")
        # Return the matched documents (chunks)
        return results.get("documents", [[]])[0]

    def retrieve_content_with_topics(self, topics):
        """
        Retrieve all chunks for the given topics for this conversation.
        """
        all_chunks = []
        for topic in topics:
            results = self.collection.get(
                where={
                    "conversation_id": self.conversation_id,
                    "topic": topic
                }
            )
            all_chunks.extend(results.get("documents", []))
        return all_chunks


