document.addEventListener('DOMContentLoaded', () => {

    // Check for display name in local storage
    if (!localStorage.getItem('name')) {

        // By default, submit button is disabled
        document.querySelector('#submit').disabled = true;

        // Enable button only if there is text in the input field
        document.querySelector('#name').onkeyup = () => {
            if (document.querySelector('#name').value.length > 0)
                document.querySelector('#submit').disabled = false;
            else
                document.querySelector('#submit').disabled = true;
        };

        // Set display name from user input
        document.querySelector('#nameform').onsubmit = () => {
            const name = document.querySelector('#name').value;

            // Store name in local storage
            localStorage.setItem('name', name);

            // Display the name
            document.querySelector('#namedisplay').innerHTML = name;

            // Clear and hide the input form
            document.querySelector('#name').value = '';
            document.querySelector('#nameform').style.display='none';

            // Stop form from submitting
            return false;
        };
    }

    else {
        // Remove the input form and display the name from local storage
        document.querySelector('#nameform').style.display='none';
        const name = localStorage.getItem('name');
        document.querySelector('#namedisplay').innerHTML = name;
    }

    // Listen for logout event
    document.querySelector('#logout').onclick = () => {
        // Remove name from local storage
        localStorage.removeItem('name');

        // Unhide display name form and clear name
        document.querySelector('#nameform').style.display='block';
        document.querySelector('#namedisplay').innerHTML = 'Display name:'
    }
});
