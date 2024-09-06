document.addEventListener('DOMContentLoaded', function() {
  let createForm = document.getElementById('createForm');
  let loginForm = document.getElementById('loginForm');
  

  async function viewDetails(event_id){
    let get_url = "/events/" + event_id;
    let response = await fetch(get_url);

    if(response.ok){
      console.log("HTTP response recieved");
    }
    else{
      console.log("Something went wrong.");
    }
  }

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

  // Event form submission handling
  let eventForm = document.getElementById("Event_Form");
  if (eventForm) {
    eventForm.addEventListener('submit', async function(e) {
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
  }

  // Stripe payment method handling
  const stripe = Stripe('pk_test_51PvXeWJy6vqrdSTUyJOib9czKHGRgYyIuLphXt2yVABNlzykHZXGsBghaUVq88v2SSVxmxmEMVkr65hHsyQ4Fkhq00UU91wRZm'); 

  // Create an instance of Elements
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  const form = document.getElementById('payment-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Create a PaymentMethod with card details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        document.getElementById('payment-message').textContent = error.message;
      } else {
        // Send the PaymentMethod ID to the server
        const response = await fetch('/save-payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethodId: paymentMethod.id })
        });

        const result = await response.json();
        if (result.success) {
          // Show a success message
          document.getElementById('payment-message').textContent = 'Payment method saved successfully!';

          // Redirect to home after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          document.getElementById('payment-message').textContent = 'Failed to save payment method.';
        }
      }
    });
    document.addEventListener('DOMContentLoaded', function() {
      var calendarEl = document.getElementById('calendar');
    
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function(fetchInfo, successCallback, failureCallback) {
          try {
            const response = await fetch('/events');  // Fetch events from the backend
            const events = await response.json();
            successCallback(events);
          } catch (error) {
            failureCallback(error);
          }
        },
        eventClick: function(info) {
          openModal(info.event);  // Open the modal when an event is clicked
        },
        dayCellMouseEnter: function(info) {
          // Show a tooltip or a list of events when hovering over a day
          showEventsForDay(info.date);
        },
        dayCellMouseLeave: function(info) {
          // Hide the tooltip or event list when no longer hovering
          hideEventList();
        }
      });
    
      calendar.render();
    
      // Function to open the event details modal
      function openModal(event) {
        document.getElementById('modalTitle').textContent = event.title;
        document.getElementById('modalDescription').textContent = event.extendedProps.description || "No description available.";
        document.getElementById('modalDates').textContent = `From ${event.start.toDateString()} to ${event.end ? event.end.toDateString() : event.start.toDateString()}`;
    
        if (event.extendedProps.attendees) {
          document.getElementById('modalAttendees').style.display = 'block';
          document.getElementById('modalAttendees').textContent = "Attendees: " + event.extendedProps.attendees.join(', ');
        }
    
        // If the user is the event owner, show the edit button
        if (event.extendedProps.isOwner) {
          document.getElementById('editEventButton').style.display = 'block';
        } else {
          document.getElementById('editEventButton').style.display = 'none';
        }
    
        // Show the modal
        document.getElementById('eventModal').style.display = 'block';
      }
    
      // Close the modal when the 'X' is clicked
      document.querySelector('.modal .close').addEventListener('click', function() {
        document.getElementById('eventModal').style.display = 'none';
      });
    
      // Function to show a list of events for a specific day when hovering
      function showEventsForDay(date) {
        // Fetch and display events for this day in a tooltip or popup
        console.log("Hovering over:", date.toDateString());
      }
    
      // Function to hide the event list when not hovering
      function hideEventList() {
        console.log("No longer hovering over the day.");
      }
    });
    
  }
});
