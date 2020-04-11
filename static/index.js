document.addEventListener('DOMContentLoaded', () => {

    // Hide channel and message submission initially
    document.querySelector('#logged-in').style.display = 'none';
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

            const name = document.querySelector('#name').value;
            // Store name in local storage
            localStorage.setItem('name', name);
            // Display the name
            document.querySelector('#name-display').innerHTML = name;
            // Clear the input form
            clearContent('#name-form');
            // Show channel and message submission
            document.querySelector('#logged-in').style.display = 'block';
            // Stop form from submitting
            return false;
        };
    }

    else {
        // Show channel and message submission
        document.querySelector('#logged-in').style.display = 'block';
        // Remove the input form and display the name from local storage
        clearContent('#name-form');
        const name = localStorage.getItem('name');
        document.querySelector('#name-display').innerHTML = name;
    }

    // Check for last channel and display
    if (localStorage.getItem('channel')) {
        const channel = localStorage.getItem('channel');
        document.querySelector('#chat-channel').innerHTML = channel;
    }

    // CHANNEL CREATION BUTTON

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
            const channel = document.querySelector('#channel').value;
            socket.emit('submit channel', {'channel': channel});

            // Clear input form
            clearContent('#channel');

            // Stop form from submitting
            return false;
        };

        // When a channel link is clicked, go to that chatroom
        document.querySelectorAll('.channel-link').forEach(link => {
            link.onclick = () => {
                // Get the channel name of the chat
                const channel = link.innerHTML;
                // Grab the channel chat data server-side
                socket.emit('join chat', {'channel': channel});
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
        alert('This channel already exists.');
    });

    // When a new channel is created, add to the unordered list
    socket.on('create channel', data => {
        // Create list element
        const li = document.createElement('li');
        // Add the list element to the channel list
        document.querySelector('#channel-list').append(li);
        // Create anchor tag
        const a = document.createElement('a');
        // Give it class and display
        a.classList.add('channel-link');
        a.innerHTML = `${data.channel}`;
        // Add anchor tag to the list element
        li.append(a);
        // Reload page to activate link (Is there a better way?)
        location.reload();
    });

    socket.on('chat joined', data => {
        const channel = data.channel;
        // Store channel name in local storage
        localStorage.setItem('channel', channel);
        // Display the channel name
        document.querySelector('#chat-channel').innerHTML = channel;
        // Clear messages from past channel
        clearContent('#message-list');
        // Display messages stored server-side
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
        //console.log(`${data.channel}`);
        //console.log(`${data.messages}`)
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
