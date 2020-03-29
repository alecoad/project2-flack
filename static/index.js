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

    // Channel submission function
    document.querySelector('#new-channel').onsubmit = () => {

        // Get the suggested new channel name
        const channel = document.querySelector('#channel').value;


        // Create new item for list
        const li = document.createElement('li');
        li.innerHTML = document.querySelector('#channel').value;

        // Add new item to channel list
        document.querySelector('#channel-list').append(li);

        // Clear input field and disable button again
        document.querySelector('#channel').value = '';
        document.querySelector('#channel-submit').disabled = true;

        // Stop form from submitting
        return false;
    };
    

    // Listen for logout event
    document.querySelector('#logout').onclick = () => {
        // Remove name from local storage
        localStorage.removeItem('name');

        // Unhide display name form and clear name
        document.querySelector('#name-form').style.display='block';
        document.querySelector('#name-display').innerHTML = 'DISPLAY NAME';
    };
});
