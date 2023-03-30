const express = require("express");

const app = express();

app.get("/test", (req, res) => {
	res.json("TEST OK");
});

app.listen(3000);
