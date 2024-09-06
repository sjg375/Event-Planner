document.addEventListener('DOMContentLoaded', function() {
  let createForm = document.getElementById('createForm');
  let loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
    
      let username = document.getElementById('username').value;
      let password = document.getElementById('password').value;
    
      let response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    
      if (response.ok) {
        document.getElementById('message').textContent = 'Login successful!';
        window.location.href = `/home/${username}`;
      } else if (response.status === 400){
        document.getElementById('message').textContent = 'Invalid Credentials';
      } else if (response.status === 500) {
        document.getElementById('message').textContent = 'Server Error';
      } else if (response.status === 403) {
        document.getElementById('message').textContent = 'Unauthorized Access';
      }
    });
  }

  if (createForm) {
    createForm.addEventListener('submit', async function(e) {
      e.preventDefault();
    
      let username = document.getElementById('newUsername').value;
      let password = document.getElementById('newPassword').value;
    
      let response = await fetch('/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    
      if (response.ok) {
        document.getElementById('message').textContent = 'Account created successfully!';
        window.location.href = `/home/${username}`;
      } else {
        document.getElementById('message').textContent = 'Account creation failed.';
      }
    });
  }

  document.getElementById("Event_Form").addEventListener('submit', async function(e) {
      e.preventDefault();

      let name = document.getElementById("name").value
      let post_url = '/events/' + name;
      
      let newEvent = {
          name: document.getElementById("name").value,
          location: document.getElementById("location").value,
          start_date: document.getElementById("start_date").value,
          end_date: document.getElementById("end_date").value,
          description: document.getElementById("description").value,
      }

      let response = await fetch(post_url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(newEvent)
      });

      if (response.ok){
          document.getElementById('message').textContent = 'Event created successfully!';
      }
      else{
          document.getElementById('message').textContent = 'Event creation failed.';
      }
  });
});