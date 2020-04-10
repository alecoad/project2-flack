document.addEventListener('DOMContentLoaded', () => {

    // DISPLAY NAME

    // Check for display name in local storage
    if (!localStorage.getItem('name')) {

        // By default, name submit button is disabled
        document.querySelector('#name-submit').disabled = true;

        // Enable button only if there is text in the input field
        document.querySelector('#name').onkeyup = () => {
            if (document.querySelector('#name').value.length > 0)
                document.querySelector('#name-submit').disabled = false;
            else
                document.querySelector('#name-submit').disabled = true;
        };

        // Set display name from user input
        document.querySelector('#name-form').onsubmit = () => {
            console.log('name submitted');
            const name = document.querySelector('#name').value;

            // Store name in local storage
            localStorage.setItem('name', name);

            // Display the name
            document.querySelector('#name-display').innerHTML = name;

            // Clear and hide the input form
            document.querySelector('#name').value = '';
            document.querySelector('#name-form').style.display='none';

            // Stop form from submitting
            return false;
        };
    }

    else {
        // Remove the input form and display the name from local storage
        document.querySelector('#name-form').style.display='none';
        const name = localStorage.getItem('name');
        document.querySelector('#name-display').innerHTML = name;
        console.log("stored name");
    }

    // Check for last channel and display
    if (localStorage.getItem('channel')) {
        const channel = localStorage.getItem('channel');
        document.querySelector('#chat-channel').innerHTML = channel;
    }

    // CHANNEL CREATION

    // By default, channel submit button is disabled
    document.querySelector('#channel-submit').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#channel').onkeyup = () => {
        if (document.querySelector('#channel').value.length > 0)
            document.querySelector('#channel-submit').disabled = false;
        else
            document.querySelector('#channel-submit').disabled = true;
    };

    // CHANNEL LIST



    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        // Form submission should emit a "submit channel" event
        document.querySelector('#channel-form').onsubmit = () => {
            console.log("submitted");
            const channel = document.querySelector('#channel').value;
            socket.emit('submit channel', {'channel': channel});

            // Clear input form
            document.querySelector('#channel').value = '';

            // Stop form from submitting
            return false;
        };

        // When a channel link is clicked, go to that chatroom
        document.querySelectorAll('.channel-link').forEach(link => {
            link.onclick = () => {
                console.log("link clicked");

                // Get the channel name of the chat
                const channel = link.innerHTML;
                console.log(channel);

                // Store channel name in local storage
                //localStorage.setItem('channel', channel);

                // Display the channel name
                //document.querySelector('#chat-channel').innerHTML = channel;

                // Clear messages from past channel
                //document.querySelector('#message-list').innerHTML = '';

                // Reload to get messages server-side from channel
                //location.reload();

                socket.emit('join chat', {'channel': channel});
                console.log("emitted");
                // Stop form from submitting
                return false;
            };
        });

        // "Submit message" event
        document.querySelector('#message-form').onsubmit = () => {
            console.log('message submitted');

            // Get the current channel and sender
            const current_channel = localStorage.getItem('channel');
            const sender = localStorage.getItem('name');

            // Store the message and time sent
            const message = document.querySelector('#message').value;
            const timestamp = Date.now();
            const time = convertTime(timestamp);

            console.log(current_channel, message, sender, time);

            // Send the message, channel, name, and timestamp
            socket.emit('submit message', {'channel': current_channel, 'message': message, 'name': sender, 'time': time});

            // Clear input form
            document.querySelector('#message').value = '';
            console.log('submit sent');

            // Stop form from submitting
            return false;
        }
    });

    // If the channel already exists, alert the user who made the submission
    socket.on('submit fail', data => {
        console.log("you fail");
        alert("This channel already exists");
    });

    // When a new channel is created, add to the unordered list
    socket.on('create channel', data => {
        console.log("received");
        const li = document.createElement('li');

        document.querySelector('#channel-list').append(li);

        // Create link with data attribute
        console.log("creating link");
        const a = document.createElement('a');
        a.classList.add('channel-link');
        a.innerHTML = `#${data.channel}`;
        console.log('done');

        // Add anchor tag to list element
        li.append(a);
        console.log('appended');

        // Reload page to activate link
        // Perhaps another way would be to create links in JS?
        location.reload();
    });

    socket.on('chat joined', data => {
        console.log("recieved");

        const channel = data.channel;

        // Store channel name in local storage
        localStorage.setItem('channel', channel);

        // Display the channel name
        document.querySelector('#chat-channel').innerHTML = channel;

        // Clear messages from past channel
        document.querySelector('#message-list').innerHTML = '';

        // Display messages stored server-side
        console.log(data.messages.length);
        for (let i = 0; i < data.messages.length; i++) {
            // Create list element that will hold elements for the name, time, and message
            const li = document.createElement('li');
            const h5 = document.createElement('h5');
            const h6 = document.createElement('h6');
            const p = document.createElement('p');

            // Populate the elements
            p.innerHTML = `${data.messages[i][0]}`;
            h5.innerHTML = `${data.messages[i][1]}`;
            h6.innerHTML = `${data.messages[i][2]}`;

            // Add the list element
            document.querySelector('#message-list').append(li);

            // Add to the list element
            li.append(h5, h6, p);
        }
        console.log(`${data.channel}`);
        console.log(`${data.messages}`)
        // Populate the messages!
    });

    // When a new message is created, add to the unordered list if in that channel
    socket.on('create message', data => {
        console.log("GOT IT!");

        if (localStorage.getItem('channel') == data.channel) {
            // Create list element that will hold elements for the name, time, and message
            const li = document.createElement('li');
            const h5 = document.createElement('h5');
            const h6 = document.createElement('h6');
            const p = document.createElement('p');

            // Populate the elements
            p.innerHTML = `${data.message}`;
            h5.innerHTML = `${data.name}`;
            h6.innerHTML = `${data.time}`;

            // Add the list element
            document.querySelector('#message-list').append(li);

            // Add to the list element
            li.append(h5, h6, p);
            console.log('if worked');
        }
        else
            console.log('if did not work');
    });



    // Listen for logout event
    document.querySelector('#logout').onclick = () => {
        // Remove name and channel from local storage
        localStorage.removeItem('name');
        localStorage.removeItem('channel');
        console.log("logged out");

        // Unhide display name form and clear name
        document.querySelector('#name-form').style.display='block';
        document.querySelector('#name-display').innerHTML = 'DISPLAY NAME';

        // Clear messages
        clearContent('#message-list');
        console.log('cleeeered');

        location.reload();
    };
});

// Clear content function
function clearContent(id) {
    document.querySelector(id).innerHTML = '';
}

// Get current time function
function convertTime(timestamp) {

     // Get the current time
     var now = new Date(timestamp);

     // Create a list of months
     var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

     // Get the month, year, date, hour, minutes, and seconds
     let month = months[now.getMonth()];
     let date = now.getDate();
     let year = now.getFullYear();
     var hours = now.getHours();
     var minutes = now.getMinutes();
     var seconds = now.getSeconds();
     var meridian = 'AM';

     // Set Hours
     if (hours >= 12){
          meridian = 'PM';
     }
     if (hours > 12){
          hours = hours - 12;
     }

     // Set Minutes
     if (minutes < 10){
          minutes = '0' + minutes;
     }

     // Set Seconds
     if (seconds < 10){
          seconds = '0' + seconds;
     }

     // Put together the time string
     var time = month + ' ' + date + ', ' + year + ' | ' + hours + ":" + minutes + ":" + seconds + " " + meridian;
     return time;
}
