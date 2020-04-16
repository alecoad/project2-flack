document.addEventListener('DOMContentLoaded', () => {

    // Hide channel and message submission initially
    document.querySelector('#logged-in').style.display = 'none';
    // Keep chat id message hidden separately
    document.querySelector('#chat-channel').style.display = 'none';

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
        // Display last joined chat if available
        if (localStorage.getItem('channel')) {
            document.querySelector('#chat-channel').style.display = 'block';
        }
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

    // CHANNEL LIST, SENDING MESSAGES
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

        // MESSAGES VIEW, REMEMBERING THE CHANNEL
        // Check for last channel and display
        if (localStorage.getItem('channel')) {
            const channel = localStorage.getItem('channel');
            document.querySelector('#chat-channel').innerHTML = channel;
            // Also display messages from that channel
            socket.emit('join chat', {'channel': channel});
        }

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
            // Get the current channel and sender
            const current_channel = localStorage.getItem('channel');
            const sender = localStorage.getItem('name');
            // Alert the user if a channel hasn't been chosen yet
            if (!current_channel)
                alert('You must join a conversation first.');
            else {
                // Store the message and time sent
                const message = document.querySelector('#message').value;
                const timestamp = Date.now();
                const time = convertTime(timestamp);
                // Send the message, channel, name, and timestamp
                socket.emit('submit message', {'channel': current_channel, 'message': message, 'name': sender, 'time': time});
                // Clear input form
                document.querySelector('#message').value = '';
                // Stop form from submitting
                return false;
            }
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
        // Clear the opening message
        clearContent('#chat-intro');
        // Make sure the page is scrolled to the top
        window.scrollTo(0, 0);
        // Display the channel name
        document.querySelector('#chat-channel').innerHTML = channel;
        document.querySelector('#chat-channel').style.display = 'block';
        // Clear messages from past channel
        clearContent('#message-list');
        // Display messages stored server-side
        for (let i = 0; i < data.messages.length; i++) {
            // Create list element that will hold elements for the name, time, and message
            const li = document.createElement('li');
            const id = document.createElement('p');
            const name = document.createElement('span');
            const time = document.createElement('span');
            const close = document.createElement('span');
            const message = document.createElement('p');
            // Populate the elements
            name.innerHTML = `${data.messages[i][1]}`;
            time.innerHTML = `${data.messages[i][2]}`;
            close.innerHTML = '&times;';
            message.innerHTML = `${data.messages[i][0]}`;
            // Give each element a class
            name.classList.add('author');
            time.classList.add('time-sent');
            close.classList.add('delete-message');
            message.classList.add('text-message');
            // Add the name and time spans to 'id' p tag
            // Add the delete button for current user's messages only
            if (localStorage.getItem('name') == `${data.messages[i][1]}`)
                id.append(name, time, close);
            else
                id.append(name, time);
            // Add to the list element
            li.append(id, message);
            // Add the list element
            document.querySelector('#message-list').append(li);
            // Color the background depending on the sender
            if (localStorage.getItem('name') == `${data.messages[i][1]}`)
                li.style.backgroundColor = 'rgb(108, 195, 213, 0.6)';
        }
    });

    // When a new message is created, add to the unordered list
    socket.on('create message', data => {
        // Create list element that will hold elements for the name, time, message, and close button
        const li = document.createElement('li');
        const id = document.createElement('p');
        const name = document.createElement('span');
        const time = document.createElement('span');
        const close = document.createElement('span');
        const message = document.createElement('p');
        // Populate the elements
        name.innerHTML = `${data.name}`;
        time.innerHTML = `${data.time}`;
        close.innerHTML = '&times;';
        message.innerHTML = `${data.message}`;
        // Give each element a class
        name.classList.add('author');
        time.classList.add('time-sent');
        close.classList.add('delete-message');
        message.classList.add('text-message');
        // Add the name and time spans to 'id' p tag
        // Add the delete button for current user's messages only
        if (localStorage.getItem('name') == `${data.name}`)
            id.append(name, time, close);
        else
            id.append(name, time);
        // Add to the list element
        li.append(id, message);
        // Add the list element
        document.querySelector('#message-list').append(li);
        // Color the background depending on the sender
        if (localStorage.getItem('name') == `${data.name}`)
            li.style.backgroundColor = 'rgb(108, 195, 213, 0.6)';
        // Keep the page scrolled to the bottom
        window.scrollTo(0, document.body.scrollHeight);
    });

    // Listen for logout event
    document.querySelector('#logout').onclick = () => {
        // Remove name and channel from local storage
        localStorage.removeItem('name');
        localStorage.removeItem('channel');
        // Unhide display name form and clear name
        document.querySelector('#name-form').style.display='block';
        // Reload
        location.reload();
    };
});

// Clear content function
function clearContent(id) {
    document.querySelector(id).innerHTML = '';
}

// Convert current timestamp function
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
     // Set hours
     if (hours >= 12){
          meridian = 'PM';
     }
     if (hours > 12){
          hours = hours - 12;
     }
     // Set minutes
     if (minutes < 10){
          minutes = '0' + minutes;
     }
     // Set seconds
     if (seconds < 10){
          seconds = '0' + seconds;
     }
     // Put together the time string
     var time = month + ' ' + date + ', ' + year + ' | ' + hours + ":" + minutes + ":" + seconds + " " + meridian;
     return time;
}
