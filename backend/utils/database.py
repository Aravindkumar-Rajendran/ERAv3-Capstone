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

def initialize_database(db_file):
    """
    Initialize the SQLite database and create necessary tables.
    :param db_file: Database file path
    """
    conn = create_connection(db_file)
    if conn is not None:
        # Create topics table
        create_topics_table_sql = """
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            topics_json TEXT NOT NULL,
            UNIQUE(conversation_id)
        );
        """
        create_table(conn, create_topics_table_sql)
        
        # Create conversations table
        create_conversations_table_sql = """
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL UNIQUE,
            conversation_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        create_table(conn, create_conversations_table_sql)
        
        conn.commit()
        conn.close()
    else:
        print("Failed to initialize database")

class DatabaseClient:
    def __init__(self, db_file):
        self.db_file = db_file
        initialize_database(db_file)

    def write_conversation(self, conversation_id, conversation_dict):
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

    def read_conversation(self, conversation_id):
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

    def write_topics(self, conversation_id, topics_list):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        topics_json = json.dumps(topics_list)
        cursor.execute(
            """
            INSERT INTO topics (conversation_id, topics_json)
            VALUES (?, ?)
            ON CONFLICT(conversation_id) DO UPDATE SET topics_json=excluded.topics_json;
            """,
            (conversation_id, topics_json)
        )
        conn.commit()
        conn.close()

    def read_topics(self, conversation_id):
        conn = create_connection(self.db_file)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT topics_json FROM topics WHERE conversation_id = ?",
            (conversation_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
        return None
    