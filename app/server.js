let express = require("express");
let { Pool } = require("pg");
let argon2 = require("argon2"); // or bcrypt, whatever
let cookieParser = require("cookie-parser");
let crypto = require("crypto");
const path = require('path');
let env = require("../env.json");

let hostname = "localhost";
let port = 3000;

let pool = new Pool(env);
let app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let tokenStorage = {};

pool.connect().then(() => {
  console.log("Connected to database");
});

/* returns a random 32 byte string */
function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

// must use same cookie options when setting/deleting a given cookie with res.cookie and res.clearCookie
// or else the cookie won't actually delete
// remember that the token is essentially a password that must be kept secret
let cookieOptions = {
  httpOnly: true, // client-side JS can't access this cookie; important to mitigate cross-site scripting attack damage
  secure: true, // cookie will only be sent over HTTPS connections (and localhost); important so that traffic sniffers can't see it even if our user tried to use an HTTP version of our site, if we supported that
  sameSite: "strict", // browser will only include this cookie on requests to this domain, not other domains; important to prevent cross-site request forgery attacks
};

// username and password validation, longer than 4 characters for username, longer than 8 characters for password
function validateLogin(body) {
  let { username, password } = body;
  
  if (typeof username !== "string" || typeof password !== "string") {
    return false;
  }

  if (username.length <= 4) {
    console.log("Username must be longer than 4 characters.");
    return false;
  }

  if (password.length <= 8) {
    console.log("Password must be longer than 8 characters.");
    return false;
  }

  let hasUpperCase = /[A-Z]/.test(password);

  if (!hasUpperCase) {
    console.log("Password must include at least one capital letter.");
    return false;
  }

  return true;
}

app.post("/create", async (req, res) => {
  let { body } = req;

  // TODO validate body is correct shape and type
  if (!validateLogin(body)) {
    return res.sendStatus(400); // TODO
  }

  let { username, password } = body;
  console.log(username, password);

  // TODO check username doesn't already exist
  // TODO validate username/password meet requirements
  let userExists;
  try {
    userExists = await pool.query(
      "SELECT 1 FROM users WHERE username = $1",
      [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).send("Username already exists");
    }
  } catch (error) {
    console.log("USER CHECK FAILED", error);
    return read.sendStatus(500);
  }

  // password hashing 
  let hash;
  try {
    hash = await argon2.hash(password);
  } catch (error) {
    console.log("HASH FAILED", error);
    return res.sendStatus(500); // TODO
  }

  console.log(hash); // TODO just for debugging

  try {
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hash,
    ]);
  } catch (error) {
    console.log("INSERT FAILED", error);
    return res.sendStatus(500); // TODO
  }

  let token = makeToken();
  tokenStorage[token] = username;
  return res.cookie("token", token, cookieOptions).status(200).send();
});


// this was fully test! 
let authorize = (req, res, next) => {
  console.log('authorization reach');
  let { token } = req.cookies;
  console.log(token, tokenStorage); // debug issue: this never ran
  if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
    return res.status(403); // if token is invalid or missing 
  }
  next();
};

// authorize test bc homepage render isnt working..
app.get('/set-token', (req, res) => {
  let token = makeToken();
  let username = 'testuser';
  tokenStorage[token] = username;

  res.cookie('token', token, cookieOptions);

  console.log('redirect will be tested');
  res.redirect('/test-auth');
});

// authroie tets 
app.get('/test-auth', authorize, (req,res) => {
  res.send('Authorixation passed');
}); 

// redirect issue
app.get('/home/:username', authorize, (req, res) => {
  console.log('this ran!')
  console.log('params', req.params);
  let username = req.params.username;
  console.log(username);
  res.render('home', { username: username });
});

app.post("/login", async (req, res) => {
  let { body } = req;

  // TODO validate body is correct shape and type
  if (!validateLogin(body)) {
    return res.status(400).json({ error : 'invalid login info'}); // TODO
  }
  let { username, password } = body;

  let result;
  try {
    result = await pool.query(
      "SELECT password FROM users WHERE username = $1",
      [username],
    );
  } catch (error) {
    console.log("SELECT FAILED", error);
    return res.status(500).json({ error: "username not found" }); // TODO
  }

  // username doesn't exist
  if (result.rows.length === 0) {
    return res.status(400).json({ error: "username not found" }); 
  }
  let hash = result.rows[0].password;

  let verifyResult;
  try {
    verifyResult = await argon2.verify(hash, password);
  } catch (error) {
    console.log("VERIFY FAILED", error);
    return res.status(500).json({error: "verification failed"}); 
  }

  // password didn't match
  console.log(verifyResult);
  if (!verifyResult) {
    console.log("Credentials didn't match");
    return res.status(400).json({error: "password is incorretc"}); 
  }

  // generate login token, save in cookie
  let token = makeToken();
  console.log("Generated token", token);
  tokenStorage[token] = username;

  res.cookie("token", token, cookieOptions);

  console.log('redirect called');
  res.redirect(`/home/${username}`);
});


app.post("/logout", (req, res) => {
  let { token } = req.cookies;

  if (token === undefined) {
    console.log("Already logged out");
    return res.sendStatus(400); // TODO
  }

  if (!tokenStorage.hasOwnProperty(token)) {
    console.log("Token doesn't exist");
    return res.sendStatus(400); // TODO
  }

  console.log("Before", tokenStorage);
  delete tokenStorage[token];
  console.log("Deleted", tokenStorage);

  return res.clearCookie("token", cookieOptions).send();
});

app.get("/public", (req, res) => {
  return res.send("A public message\n");
});

// authorize middleware will be called before request handler
// authorize will only pass control to this request handler if the user passes authorization
app.get("/private", authorize, (req, res) => {
  return res.send("A private message\n");
});

app.get("/events", async (req, res) => {
  //Should Serve all events
  let haveEvents;
  try{
    haveEvents = await pool.query(
      "SELECT name, location, start_date, end_date, description, attendees FROM events FOR JSON PATH"
    );
  }
  catch(error){
    console.log("SELECT FAILED", error);
    return res.sendStatus(500);
  }

  return res.status(200).json(haveEvents);
});


//Still need to add cookie saving to relate the event to the creator
app.post("/api/:event", async (req, res) => {
  //Enter Event into the database
  let event = req.params.event;
  let body = req.body;
  let props = ['name', 'location', 'start_date', 'end_date', 'description', 'attendees'];
  let hasAllProps = props.every(p => body.hasOwnProperty(p));
  let {name, location, start_date, end_date, description, attendees} = body;


  //check that the event json is valid
  if(!hasAllProps){
    console.log("Incorrect event structure!\n");
    return res.sendStatus(400);
  }

  //check if event with this name already exists
  let eventExists;
  try{
    eventExists = await pool.query(
      "SELECT 1 FROM events WHERE name = $1",
      [event]
    );
    if(eventExists.rows.length > 0){
      return res.status(400).send("Event already exists");
    }
  }
  catch(error){
    console.log("Event check failed!", error);
    return res.sendStatus(500);
  }

  try{
    await pool.query("INSERT INTO events (name, location, start_date, end_date, description, attendees) VALUES ($1, $2, $3, $4, $5, $6)", [
      name,
      location,
      start_date,
      end_date,
      description,
      attendees,
    ]);
  }
  catch(error){
    console.log("INSERT FAILED", error);
    return res.sendStatus(500);
  }
  
  res.status(200);
  res.send();
});

app.get("/api/:event", async (req, res) => {
  //Should serve the event object
  let event = req.params.event;

  let eventExists;
  try{
    eventExists = await pool.query(
      "SELECT 1 FROM events WHERE name = $1 FOR JSON PATH",
      [event]
    );
    if(eventExists.rows.length < 1){
      return res.status(400).send("Event does not exist");
    }
  }
  catch(error){
    console.log("Event check failed!", error);
    return res.sendStatus(500);
  }

  return res.status(200).json(eventExists);
});

app.put("/api/:event", async (req, res) => {
  //Check that the user sending the request is the creator of the event. If so, update the database
  
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
