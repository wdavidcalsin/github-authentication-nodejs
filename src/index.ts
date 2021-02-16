import express from "express";
import axios from "axios";

const app = express();

const port: string | number = process.env.PORT || 5000;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// app.set('view engine', 'ejs');
let access_token = "";

app.get("/", (req, res) => {
  res.send({ client_id: clientID });
});

app.get("/github/callback", (req, res) => {
  const requestToken = req.query.code;

  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,

    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    access_token = response.data.access_token;
    res.redirect("/success");
  });
});

app.get("/success", (req, res) => {
  axios({
    method: "get",
    url: `https://api.github.com/user`,
    headers: {
      Authorization: `token ${access_token}`,
    },
  }).then((response) => {
    res.send({ userData: response.data });
    console.log(response.data);
  });
});

// app.get("/", async (req, res) => {
//   const data = axios
//     .get("https://api.github.com/users/wdavidcalsin")
//     .then((res) => res.data);
//   console.log(await data);
//   res.send(await data);
// });

app.listen(port, () => console.log(`Hosting @${port}`));
