import express from "express";

const app = express();

const port: string | number = process.env.PORT || 5000;

app.use("*", (req, res) => res.send("<h1>Welcome to your server David!</h1>"));
console.log("david");

app.listen(port, () => console.log(`Hosting @${port}`));
