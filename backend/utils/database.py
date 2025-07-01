# setup sqlite database
import sqlite3
from sqlite3 import Error
import json

def create_connection(db_file):
    """
    Create a database connection to the SQLite database specified by db_file.
    :param db_file: Database file path
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        print(f"Connected to database: {db_file}")
    except Error as e:
        print(f"Error connecting to database: {e}")
    return conn

def create_table(conn, create_table_sql):
    """
    Create a table from the create_table_sql statement.
    :param conn: Connection object
    :param create_table_sql: CREATE TABLE statement
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
        print("Table created successfully")
    except Error as e:
        print(f"Error creating table: {e}")

def migrate_database(conn):
    """
    Add user_id columns to existing tables for user data isolation
    Also add project_id to conversations if missing
    """
    cursor = conn.cursor()
    
    # Check if user_id column exists in topics table
    cursor.execute("PRAGMA table_info(topics)")
    topics_columns = [col[1] for col in cursor.fetchall()]
    if 'user_id' not in topics_columns:
        cursor.execute("ALTER TABLE topics ADD COLUMN user_id TEXT")
        print("Added user_id column to topics table")
    
    # Check if user_id column exists in conversations table
    cursor.execute("PRAGMA table_info(conversations)")
    conversations_columns = [col[1] for col in cursor.fetchall()]
    if 'user_id' not in conversations_columns:
        cursor.execute("ALTER TABLE conversations ADD COLUMN user_id TEXT")
        print("Added user_id column to conversations table")
    
    # Check if user_id column exists in chat_messages table
    cursor.execute("PRAGMA table_info(chat_messages)")
    chat_messages_columns = [col[1] for col in cursor.fetchall()]
    if 'user_id' not in chat_messages_columns:
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN user_id TEXT")
        print("Added user_id column to chat_messages table")
    
    # Check if user_id column exists in interactive_content table
    cursor.execute("PRAGMA table_info(interactive_content)")
    interactive_content_columns = [col[1] for col in cursor.fetchall()]
    if 'user_id' not in interactive_content_columns:
        cursor.execute("ALTER TABLE interactive_content ADD COLUMN user_id TEXT")
        print("Added user_id column to interactive_content table")

    # Check if project_id column exists in conversations table
    cursor.execute("PRAGMA table_info(conversations)")
    conversations_columns = [col[1] for col in cursor.fetchall()]
    if 'project_id' not in conversations_columns:
        cursor.execute("ALTER TABLE conversations ADD COLUMN project_id TEXT")
        print("Added project_id column to conversations table")

def initialize_database(db_file):
    """
    Initialize the SQLite database and create necessary tables.
    :param db_file: Database file path
    """
    conn = create_connection(db_file)
    if conn is not None:
        # Create topics table - MODIFIED: now uses project_id instead of conversation_id
        create_topics_table_sql = """
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            topics_json TEXT NOT NULL,
            user_id TEXT,
            UNIQUE(project_id)
        );
        """
        create_table(conn, create_topics_table_sql)
        
        # Create conversations table - now with project_id
        create_conversations_table_sql = """
        CREATE TABLE IF NOT EXISTS conversations (
            conversation_id TEXT PRIMARY KEY,
            title TEXT,
            user_id TEXT,
            project_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_conversations_table_sql)
        
        # Create chat_messages table - NEW: proper message storage
        create_chat_messages_table_sql = """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
            message_content TEXT NOT NULL,
            user_id TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
        );
        """
        create_table(conn, create_chat_messages_table_sql)
        
        # Create interactive_content table
        create_interactive_content_table_sql = """
        CREATE TABLE IF NOT EXISTS interactive_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interact_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            content_json TEXT NOT NULL,
            topics_used TEXT NOT NULL,
            user_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_interactive_content_table_sql)
        
        # Create users table - NEW: for authentication
        create_users_table_sql = """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            email_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_users_table_sql)
        
        # Create projects table
        create_projects_table_sql = """
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_projects_table_sql)
        
        # Create sources table
        create_sources_table_sql = """
        CREATE TABLE IF NOT EXISTS sources (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            content TEXT,
            url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_sources_table_sql)
        
        # Create interactive_history table
        create_interactive_history_table_sql = """
        CREATE TABLE IF NOT EXISTS interactive_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            topics TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_interactive_history_table_sql)
        
        # Run migration for existing databases
        migrate_database(conn)
        
        conn.commit()
        conn.close()
    else:
        print("Failed to initialize database")

class DatabaseClient:
    def __init__(self, db_file):
        self.db_file = db_file
        initialize_database(db_file)

    # DEPRECATED: Old conversation method - keeping for backward compatibility
    def write_conversation(self, conversation_id, conversation_dict):
        """DEPRECATED: Use write_chat_message instead"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        conversation_json = json.dumps(conversation_dict)
        cursor.execute(
            """
            INSERT INTO conversations (conversation_id, conversation_json)
            VALUES (?, ?)
            ON CONFLICT(conversation_id) DO UPDATE SET conversation_json=excluded.conversation_json;
            """,
            (conversation_id, conversation_json)
        )
        conn.commit()
        conn.close()

    # DEPRECATED: Old conversation method - keeping for backward compatibility
    def read_conversation(self, conversation_id):
        """DEPRECATED: Use read_chat_messages instead"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT conversation_json FROM conversations WHERE conversation_id = ?",
            (conversation_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
        return None

    # NEW: Proper conversation management
    def create_conversation(self, conversation_id, title=None, user_id=None, project_id=None):
        """Create a new conversation record"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO conversations (conversation_id, title, user_id, project_id)
            VALUES (?, ?, ?, ?);
            """,
            (conversation_id, title or f"Conversation {conversation_id[:8]}", user_id, project_id)
        )
        conn.commit()
        conn.close()

    # NEW: Proper message storage
    def write_chat_message(self, conversation_id, message_type, message_content, user_id=None, project_id=None):
        """
        Write a single chat message to the database
        :param conversation_id: Conversation ID
        :param message_type: 'user' or 'assistant'
        :param message_content: The message content
        :param user_id: User ID for data isolation
        :param project_id: Project ID for project isolation
        """
        # Ensure conversation exists
        self.create_conversation(conversation_id, user_id=user_id, project_id=project_id)
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO chat_messages (conversation_id, message_type, message_content, user_id)
            VALUES (?, ?, ?, ?);
            """,
            (conversation_id, message_type, message_content, user_id)
        )
        # Update conversation's updated_at timestamp
        if user_id:
            cursor.execute(
                """
                UPDATE conversations 
                SET updated_at = CURRENT_TIMESTAMP 
                WHERE conversation_id = ? AND user_id = ?;
                """,
                (conversation_id, user_id)
            )
        else:
            cursor.execute(
                """
                UPDATE conversations 
                SET updated_at = CURRENT_TIMESTAMP 
                WHERE conversation_id = ?;
                """,
                (conversation_id,)
            )
        conn.commit()
        conn.close()

    # NEW: Read all messages for a conversation
    def read_chat_messages(self, conversation_id, user_id=None):
        """
        Read all chat messages for a conversation in chronological order
        :param conversation_id: Conversation ID
        :param user_id: User ID for data isolation
        :return: List of messages with type and content
        """
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        
        if user_id:
            cursor.execute(
                """
                SELECT message_type, message_content, timestamp 
                FROM chat_messages 
                WHERE conversation_id = ? AND user_id = ?
                ORDER BY timestamp ASC;
                """,
                (conversation_id, user_id)
            )
        else:
            cursor.execute(
                """
                SELECT message_type, message_content, timestamp 
                FROM chat_messages 
                WHERE conversation_id = ? 
                ORDER BY timestamp ASC;
                """,
                (conversation_id,)
            )
        
        rows = cursor.fetchall()
        conn.close()
        
        if rows:
            messages = []
            for row in rows:
                messages.append({
                    "type": row[0],
                    "content": row[1],
                    "timestamp": row[2]
                })
            return messages
        return []

    # NEW: Get conversation info
    def get_conversation_info(self, conversation_id, user_id=None):
        """Get conversation metadata"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        
        if user_id:
            cursor.execute(
                """
                SELECT title, created_at, updated_at 
                FROM conversations 
                WHERE conversation_id = ? AND user_id = ?;
                """,
                (conversation_id, user_id)
            )
        else:
            cursor.execute(
                """
                SELECT title, created_at, updated_at 
                FROM conversations 
                WHERE conversation_id = ?;
                """,
                (conversation_id,)
            )
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "conversation_id": conversation_id,
                "title": row[0],
                "created_at": row[1],
                "updated_at": row[2]
            }
        return None

    # MODIFIED: Topics methods now work with project_id instead of conversation_id
    def write_topics(self, project_id, topics_list, user_id=None):
        """
        Write topics for a project
        :param project_id: Project ID
        :param topics_list: List of topics
        :param user_id: User ID for data isolation
        """
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        topics_json = json.dumps(topics_list)
        cursor.execute(
            """
            INSERT INTO topics (project_id, topics_json, user_id)
            VALUES (?, ?, ?)
            ON CONFLICT(project_id) DO UPDATE SET topics_json=excluded.topics_json, user_id=excluded.user_id;
            """,
            (project_id, topics_json, user_id)
        )
        conn.commit()
        conn.close()

    def read_topics(self, conversation_id, user_id=None):
        """
        DEPRECATED: Use read_project_topics instead
        Read topics for a conversation (legacy method)
        """
        # Get project_id from conversation
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        
        if user_id:
            cursor.execute(
                "SELECT project_id FROM conversations WHERE conversation_id = ? AND user_id = ?",
                (conversation_id, user_id)
            )
        else:
            cursor.execute(
                "SELECT project_id FROM conversations WHERE conversation_id = ?",
                (conversation_id,)
            )
        
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0]:
            return self.read_project_topics(row[0], user_id)
        return None

    def read_project_topics(self, project_id, user_id=None):
        """
        Read topics for a project
        :param project_id: Project ID
        :param user_id: User ID for data isolation
        :return: List of topics or None
        """
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        
        if user_id:
            cursor.execute(
                "SELECT topics_json FROM topics WHERE project_id = ? AND user_id = ?",
                (project_id, user_id)
            )
        else:
            cursor.execute(
                "SELECT topics_json FROM topics WHERE project_id = ?",
                (project_id,)
            )
        
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
        return None

    def write_interactive_content(self, interact_id, project_id, content_type, content_json, topics_used, user_id=None):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        content_json_str = json.dumps(content_json)
        topics_used_str = json.dumps(topics_used)
        cursor.execute(
            """
            INSERT INTO interactive_content (interact_id, project_id, content_type, content_json, topics_used, user_id)
            VALUES (?, ?, ?, ?, ?, ?);
            """,
            (interact_id, project_id, content_type, content_json_str, topics_used_str, user_id)
        )
        conn.commit()
        conn.close()

    def write_interactive_history(self, user_id, project_id, content_type, topics):
        """Insert a new interactive history record for a user and project."""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO interactive_history (user_id, project_id, content_type, topics)
            VALUES (?, ?, ?, ?);
            """,
            (user_id, project_id, content_type, json.dumps(topics))
        )
        # Get the ID of the inserted row
        cursor.execute("SELECT last_insert_rowid()")
        last_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return last_id

    def read_interactive_content(self, interact_id, user_id=None):
        print(f"📖 Reading interactive content for interact_id: {interact_id}, user_id: {user_id}")
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        
        if user_id:
            print(f"🔍 Querying with user_id filter")
            cursor.execute(
                """
                SELECT content_type, content_json, topics_used, created_at 
                FROM interactive_content 
                WHERE interact_id = ? AND user_id = ?
                """,
                (str(interact_id), user_id)
            )
        else:
            print(f"🔍 Querying without user_id filter")
            cursor.execute(
                """
                SELECT content_type, content_json, topics_used, created_at 
                FROM interactive_content 
                WHERE interact_id = ?
                """,
                (str(interact_id),)
            )
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            print(f"✅ Found interactive content of type: {row[0]}")
            return {
                "content_type": row[0],
                "content_json": json.loads(row[1]),
                "topics_used": json.loads(row[2]),
                "created_at": row[3]
            }
        print(f"❌ No interactive content found for interact_id: {interact_id}")
        return None

    # NEW: User management methods
    def create_or_update_user(self, user_id, email, name=None, email_verified=False):
        """Create or update user record"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (user_id, email, name, email_verified, last_login)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET 
                email=excluded.email,
                name=excluded.name,
                email_verified=excluded.email_verified,
                last_login=CURRENT_TIMESTAMP;
            """,
            (user_id, email, name, email_verified)
        )
        conn.commit()
        conn.close()

    def get_user(self, user_id):
        """Get user information"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id, email, name, email_verified, created_at, last_login FROM users WHERE user_id = ?",
            (user_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "user_id": row[0],
                "email": row[1], 
                "name": row[2],
                "email_verified": row[3],
                "created_at": row[4],
                "last_login": row[5]
            }
        return None

    def get_user_by_email(self, email):
        """Get user information by email address"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id, email, name, email_verified, created_at, last_login FROM users WHERE email = ?",
            (email,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "user_id": row[0],
                "email": row[1], 
                "name": row[2],
                "email_verified": row[3],
                "created_at": row[4],
                "last_login": row[5]
            }
        return None

    def get_user_conversations(self, user_id, project_id=None):
        """Get all conversations for a user and project"""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        if project_id:
            cursor.execute(
                """
                SELECT conversation_id, title, created_at, updated_at 
                FROM conversations 
                WHERE user_id = ? AND project_id = ?
                ORDER BY updated_at DESC;
                """,
                (user_id, project_id)
            )
        else:
            cursor.execute(
                """
                SELECT conversation_id, title, created_at, updated_at 
                FROM conversations 
                WHERE user_id = ?
                ORDER BY updated_at DESC;
                """,
                (user_id,)
            )
        rows = cursor.fetchall()
        conn.close()
        conversations = []
        for row in rows:
            conversations.append({
                "conversation_id": row[0],
                "title": row[1],
                "created_at": row[2],
                "updated_at": row[3]
            })
        return conversations

    def create_project(self, project_id, user_id, name):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO projects (id, user_id, name)
            VALUES (?, ?, ?)
            ON CONFLICT(id) DO NOTHING;
            """,
            (project_id, user_id, name)
        )
        conn.commit()
        conn.close()

    def list_projects(self, user_id):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, created_at, last_accessed_at FROM projects WHERE user_id = ? ORDER BY last_accessed_at DESC;
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        projects = []
        for row in rows:
            projects.append({
                "id": row[0],
                "name": row[1],
                "created_at": row[2],
                "last_accessed_at": row[3]
            })
        return projects

    def get_project(self, project_id, user_id):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, created_at, last_accessed_at FROM projects WHERE id = ? AND user_id = ?;
            """,
            (project_id, user_id)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "created_at": row[2],
                "last_accessed_at": row[3]
            }
        return None

    def write_source(self, source_id, user_id, project_id, name, type_, content=None, url=None):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO sources (id, user_id, project_id, name, type, content, url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, type=excluded.type, content=excluded.content, url=excluded.url;
            """,
            (source_id, user_id, project_id, name, type_, content, url)
        )
        conn.commit()
        conn.close()

    def list_sources(self, user_id, project_id):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, type, created_at FROM sources WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC;
            """,
            (user_id, project_id)
        )
        rows = cursor.fetchall()
        conn.close()
        sources = []
        for row in rows:
            sources.append({
                "id": row[0],
                "name": row[1],
                "type": row[2],
                "created_at": row[3]
            })
        return sources

    def read_interactive_history(self, user_id, project_id, limit=10):
        """Fetch the most recent interactive history records for a user and project (default 10)."""
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT h.id, h.content_type, h.topics, h.created_at, c.interact_id
            FROM interactive_history h
            LEFT JOIN interactive_content c ON 
                c.project_id = h.project_id AND 
                c.content_type = h.content_type AND 
                c.user_id = h.user_id AND
                c.created_at = h.created_at
            WHERE h.user_id = ? AND h.project_id = ?
            ORDER BY h.created_at DESC
            LIMIT ?
            """,
            (user_id, project_id, limit)
        )
        rows = cursor.fetchall()
        conn.close()
        history = []
        for row in rows:
            history.append({
                "id": row[0],
                "content_type": row[1],
                "topics": json.loads(row[2]),
                "created_at": row[3],
                "interact_id": row[4]
            })
        return history
    