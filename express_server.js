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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "maj456"},
  "9sm5xK": { longURL: "http://www.google.com", userId: "maj456"},
  "7hi8eK": { longURL: "http://www.cnn.com", userId: "maj123"}
};


const users = {
  "maj123": {id: "maj123", email: "migang9@gmail.com", password: "123"},
  "maj456": {id: "maj456", email: "majs8323@gmail.com", password: "123"}
};
//function to search the email in users object
const findUserByEmail = (email, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

//function to return url by user
const urlsForUser = (id, urlDatabase) => {
  let currentUserId = id;
  let userURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userId === currentUserId) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
};

//Show urls page with the urls
app.get('/urls', (req, res) => {
  const userLogged = users[req.cookies["user_id"]];
  console.log(userLogged);
  if (!userLogged) {
    res.send('First, Login or Register, thanks!!');
    return;
  }
  const urls = urlsForUser(req.cookies["user_id"], urlDatabase);
  const templateVars = { username: users[req.cookies["user_id"]], urls};
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
//
app.get("/urls/new", (req, res) => {
//const userLogged = {username: users[req.cookies["user_id"]]}; wrong!!
  const userLogged = users[req.cookies["user_id"]];
  console.log(userLogged);
  if (!userLogged) {
    res.redirect('/login');
    return;
  }
  const templateVars = {username: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userLogged = users[req.cookies["user_id"]];
  console.log(userLogged);
  if (!userLogged) {
    res.redirect('/login');
    return;
  }
  let temp = req.params.shortURL; // temp will have the value of shortURL, which is what we type in browser after /urls/:
  const templateVars = { shortURL: temp, longURL: urlDatabase[temp]["longURL"], username: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: users[req.cookies["user_id"]]
  };
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const key = req.params.shortURL;
  urlDatabase[key] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //const urls = urlsForUser([req.cookies['user_id']], urlDatabase);
  //const templateVars = { username: users[req.cookies["user_id"]], urls.id};
  //console.log("prueba", templateVars);
  //const shortURL = req.params.shortURL;
  //if (actualUser !== urlDatabase[shortURL].userID) {
  //  res.send('This id does not belong to you');
  //}
  //const templateVars = { username: users[req.cookies["user_id"]], urls};
  
  //const urls = urlsForUser(req.cookies["user_id"], urlDatabase);
  const userLogged = [req.cookies["user_id"]];
  let urlDel = req.params.shortURL;
  if (!userLogged) {
    return res.redirect('/login');
  } else if (urlDatabase[urlDel].userID !== userLogged) {
    res.send('This is not belong to you');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: users[req.cookies["user_id"]]};
  res.redirect(`/urls/${shortURL}`);
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get('/register', (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.send('Error: You need an Email and Password to Register', 400);
  }
  if (findUserByEmail(email, users)) {
    res.send('403: Bad Request', 400);
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email,
      password
    };
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
});

app.get('/login', (req, res) => {
  let templateVars = {username: users[req.cookies['user_id']], users};
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  let user = findUserByEmail(req.body.email, users);
  if (user && user.password === req.body.password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.send('403: Forbidden Error', 403);
  }
});

