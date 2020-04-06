import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Create a list of dicts to hold all the Chat objects
chats = {}

# Create a variable to store the current channel
current_channel = 'two';

# Test chats
#chat1 = Chat("ONE", [('hi', 'andrew', 1), ('what?', 'ellie', 2), ('bye', 'gary', 3)])
#chat2 = Chat("TWO", [('hello', 'andrew', 10), ('who?', 'ellie', 20), ('bye, bye!', 'gary', 30)])

#chats.append(chat1)
#chats.append(chat2)


@app.route("/")
def index():
    return render_template("index.html", chats=chats, current_channel=current_channel)


@socketio.on("submit channel")
def submit_channel(data):
    channel = data["channel"]

    # Check chat list for channel name, kickback if duplicate
    for chat in chats:
        if channel in chat:
            emit("submit fail", broadcast=False)
            break;
    else:
        chats.update({channel:[]})
        emit("create channel", {"channel": channel}, broadcast=True)


@socketio.on("join chat")
def join_chat(data):
    current_channel = data["channel"]
    channel_messages = chats[current_channel]
    emit("chat joined", {"channel": current_channel, "messages": channel_messages}, broadcast=False)


@socketio.on("submit message")
def submit_message(data):
    channel = data["channel"]
    name = data["name"]
    message = data["message"]
    time = data["time"]

    # Add the message as the channel key's value
    chats[channel].append((message, name, time))

    emit("create message", {"channel": channel, "message": message, "name": name, "time": time}, broadcast=True)



if __name__ == '__main__':
    socketio.run(app)
