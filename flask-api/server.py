import os
import uuid
import json
from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from peewee import Model, CharField, TextField, SqliteDatabase
from dotenv import load_dotenv

load_dotenv()

db = SqliteDatabase('aibrainstorm.db')


# Define a Peewee model for the form
class Idea(Model):
    name = CharField()

    class Meta:
        database = db


# Create the table in the database if it doesn't exist
db.connect()
db.create_tables([Idea])

app = Flask(__name__)
app.secret_key = 'flask-secret-key'

CORS(app)


store = {}  # memory is maintained outside the chain
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", api_key=os.getenv("OPENAI_KEY"))
memory = ConversationBufferMemory()


def get_session_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


def create_conversation(session_id):
    memory = ConversationBufferMemory(memory_key=session_id)
    conversation = RunnableWithMessageHistory(
        llm, lambda: get_session_history(session_id), memory=memory)
    return conversation


@app.route('/api/conversations/ideas', methods=['GET'])
def get_ideas():
    ideas = [idea for idea in Idea.select().dicts()]
    print(">>>>", ideas)
    return jsonify(list(ideas))


@app.route('/api/conversations/chat', methods=['POST'])
def generate_form():
    user_prompt = request.json.get("message")
    memory_key = request.json.get('mem_id')
    created_form = None

    prompt = """
        The user has already provided some context and ideas in the conversation.
        You are an AI assistant helping to brainstorm and expand on ideas in a continuous session.
                
        User's latest input:
        {user_prompt}
        
        Respond in JSON format like this: 
        {{"conversation_type": "idea_request", "ideas_category": "category name", "ideas": ["first idea", "second idea"]}}.
        
        Your response should build on the previous ideas mentioned in the conversation history and suggest new related ideas. 
        If the user asks to save ideas, respond with:
        {{"conversation_type": "save_request", "ideas_category": "category name", "ideas": ["first idea", "second idea"]}}.
        
        Ensure that the ideas remain relevant to the context provided by the user and the conversation so far.
    """.format(user_prompt=user_prompt)

    print("mem_id...", memory_key)
    mem_key = memory_key
    if not mem_key or mem_key == "null":
        mem_key = str(uuid.uuid4())

    conversation = create_conversation(mem_key)
    response = conversation.invoke(
        input=prompt, config={"configurable": {"session_id": mem_key}})
    print("created_form>>>", response.content)
    data = json.loads(response.content)
    if data["conversation_type"] == "save_request":
        for idea in data["ideas"]:
            Idea.create(
                name=idea
            )

    return jsonify({"reply": data, "created": created_form})


if __name__ == "__main__":
    app.run(debug=True)
