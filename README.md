# Project 2: Flack

Web Programming with Python and JavaScript

This is FLASK, a single page messaging service mimicking Slack, but using Flask. Python handles the server-side storage of the different channels and messages within each channel. Flask-SocketIO enables communication between JavaScript and Python in order to update the channel and message submissions in real time.

All of the HTML is contained within index.html in the templates folder. Bootswatch's Minty theme was used for styling, along with custom styling and layout in styles.css within the static folder. (Static also holds the favicon and background image.)

application.py contains the python code that listens for and emits events being broadcast by users. This is also where the channels and messages are stored. Each channel can only hold up to 100 messages.

The bulk of this adventure is held in static/index.js. This is how the display name and current channel are both stored in localStorage, so if the user closes the page and revists, he or she will still be "logged in" and back in the same channel. This is also where the connection to the websocket is created and where all the form submissions and mouse clicks emit events to the server, while listening for and receiving events being broadcast by other users. Also, when the log out button is clicked, localStorage is cleared.

And finally, the personal touch, deleting one's own messages: The user can click the "x" on the right side of any of his or her own messages to permanently delete the message. (This event is not broadcast to all users though. Other users will be able to see the messages until the page is refreshed manually. This was intentional so that users don't see random messages from others disappearing in the middle of a chat.)

Other personal touches include the "Log Out" functionality, timestamp with the date included, and the layout and styling.

HOW TO RUN:
1. From the project directory in your terminal, run pip3 install -r requirements.txt to make sure that all of the necessary Python packages are installed.
2. Set the environment variable FLASK_APP to be application.py.
3. Run python3 application.py.
