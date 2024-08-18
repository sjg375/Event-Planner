//Server.js
let express = require("express");
let app = express();
app.use(express.json());

let port = 3000;
let hostname = "localhost";

//A Postgres database of events may be better
let Events = {};

app.get("/events", (req, res) => {
  //Should Serve all events
});

app.post("/api/:eventid", (req, res) => {
  //Recieve a JSON object with a name, location, start date, and end date
  
});

app.get("/api/:eventid", (req, res) => {
  //Should serve the event object
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
