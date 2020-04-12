import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Create a dictionary to hold all the chats
# The key is the channel, the value is a list of the messages in that channel
chats = {}

# 100 messages
#l = []
#for i in range(100):
#    l.append(["hun", i, "name", 2020])

# Channel with 100 messages
#chats = {"hun": l}

current_channel = None;

@app.route("/")
def index():
    return render_template("index.html", chats=chats, current_channel=current_channel)


@socketio.on("submit channel")
def submit_channel(data):
    channel = data["channel"]

    # Go through each chat
    for chat in chats:
        # Check for duplicate channel name
        if channel in chat:
            # Tell JS to alert the submitter only
            emit("submit fail", broadcast=False)
            break;
    else:
        # Add the channel and an empty list for messages
        chats.update({channel:[]})
        emit("create channel", {"channel": channel}, broadcast=True)


@socketio.on("join chat")
def join_chat(data):
    # Get the channel and messages from the clicked channel
    current_channel = data["channel"]
    channel_messages = chats[current_channel]
    # Tell JS to display the current channel and the messages to the user who clicked the channel only
    emit("chat joined", {"channel": current_channel, "messages": channel_messages}, broadcast=False)


@socketio.on("submit message")
def submit_message(data):
    channel = data["channel"]
    name = data["name"]
    message = data["message"]
    time = data["time"]

    # Add the message as the channel key's value
    chats[channel].append((message, name, time))

    # Keep the total messages under 100
    if len(chats[channel]) > 100:
        chats[channel].pop(0)

    emit("create message", {"channel": channel, "message": message, "name": name, "time": time}, broadcast=True)


if __name__ == '__main__':
    socketio.run(app)
