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
      } else {
        document.getElementById('message').textContent = 'Login failed.';
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
      } else {
        document.getElementById('message').textContent = 'Account creation failed.';
      }
    });
  }

  document.getElementById("Event_Form").addEventListener('submit', async function(e) {
      e.preventDefault();

      let name = document.getElementById("name").value
      let post_url = '/api/' + name;
      
      let newEvent = {
          name: document.getElementById("name").value,
          location: document.getElementById("location").value,
          start_date: document.getElementById("start_date").value,
          end_date: document.getElementById("end_date").value,
          description: document.getElementById("description").value,
          attendees: [],
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