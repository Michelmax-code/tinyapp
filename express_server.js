const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2,8);
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]]};
  res.render('urls_index', templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let temp = req.params.shortURL; // temp will have the value of shortURL, which is what we type in browser after /urls/:
  const templateVars = { shortURL: temp, longURL: urlDatabase[temp], username: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const key = req.params.shortURL;
  urlDatabase[key] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  console.log('name', req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };
  res.cookie('email', email);
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
