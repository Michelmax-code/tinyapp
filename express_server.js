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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userId: "aJ48lW"}
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

//Show urls page with the urls
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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  res.redirect("/urls");
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

const users = {
  /*"userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }*/
};

app.get('/login', (req, res) => {
  let templateVars = {username: users[req.cookies['user_id']]};
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

