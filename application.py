import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Store list of all the channels
channels = []
votes = {"yes": 0, "no": 0, "maybe": 0}


@app.route("/")
def index():
    return render_template("index.html", votes=votes)


@socketio.on("new channel")
def vote(data):
    channel = data["channel"]
    channels.append(channel)
    emit("announce channel", {"channel": channel}, broadcast=True)


if __name__ == '__main__':
    socketio.run(app)
