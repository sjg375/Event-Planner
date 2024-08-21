document.getElementById('loginForm').addEventListener('submit', async function(e) {
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
  
  document.getElementById('createForm').addEventListener('submit', async function(e) {
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
  