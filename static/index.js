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
        a.href = '';
        a.classList.add('channel-link');
        console.log('dokljasldfne');
        a.dataset.page = `${data.channel}`;
        console.log('doLKAJSDLKFne');
        a.innerHTML = `#${data.channel}`;
        console.log('done');

        // Add anchor tag to list element
        li.append(a);
        console.log('appended');

        // Reload page to activate link
        // Perhaps another way would be to create links in JS?
        //location.reload();
    });

    // CHANNEL LIST

    // When a channel link is clicked, go to that chatroom
    document.querySelectorAll('.channel-link').forEach(link => {
        link.onclick = () => {
            console.log("link clicked");

            // Display the channel name of the chat
            const channel = link.innerHTML;
            console.log(channel);

            // Store channel name in local storage
            localStorage.setItem('channel', channel);

            // Display the channel name
            document.querySelector('#chat-channel').innerHTML = channel;

            // Stop form from submitting
            return false;
        };
    });



    // Set links up to load new pages.
//    document.querySelectorAll('.channel-link').forEach(link => {
//        link.onclick = () => {
//            const page = link.dataset.page;
            //load_page(page);
//            load_page('channel');
//            return false;
//        };
//    });




    // Listen for logout event
    document.querySelector('#logout').onclick = () => {
        // Remove name from local storage
        localStorage.removeItem('name');
        console.log("logged out");

        // Unhide display name form and clear name
        document.querySelector('#name-form').style.display='block';
        document.querySelector('#name-display').innerHTML = 'DISPLAY NAME';
    };
});

// Update chat messages on popping state.
//window.onpopstate = e => {
//    const data = e.state;
//    document.title = data.title;
//    document.querySelector('#chatroom').innerHTML = data.text;
//};

// Renders contents of the chat in main view.
//function load_page(name) {
//    const request = new XMLHttpRequest();
//    request.open('GET', `/channel/${name}`);
//    request.onload = () => {
//        const response = request.responseText;
//        document.querySelector('#chatroom').innerHTML = response;

        // Push state to URL.
//        document.title = name;
//        history.pushState({'title': name, 'text': response}, name, name);
//    };
//    request.send();
//}
