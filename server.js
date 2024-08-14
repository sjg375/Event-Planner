//Server.js
let express = require("express");
let app = express();
app.use(express.json());

let port = 3000;
let hostname = "localhost";

//A Postgres database of events may be better
let Events = {};

app.post("/", (req, res) => {
  //Should Serve all events
});

app.post("/api/:eventid", (req, res) => {
  //Need to decide what is included in the json body
});

app.get("/api/:eventid", (req, res) => {
  //Should serve the event
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
