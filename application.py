import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Create a chat class to hold up to 100 messages for each channel
class Chat:
    def __init__(self, channel, messages):
        self.channel = channel
        self.messages = messages

# Create a list to hold all the Chat objects
chats = []

@app.route("/")
def index():
    return render_template("index.html", chats=chats)


@socketio.on("submit channel")
def submit_channel(data):
    channel = data["channel"]

    # Check chat list for channel name, kickback if duplicate
    for chat in chats:
        if channel in chat.channel:
            emit("submit fail", broadcast=False)
            break;
    else:
        chats.append(Chat(channel, []))
        emit("create channel", {"channel": channel}, broadcast=True)




if __name__ == '__main__':
    socketio.run(app)
