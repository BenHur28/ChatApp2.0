require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);

mongoose.connect(process.env.MONGODB_URL);
jwtSecret = process.env.JWT_SECRET;

app.get("/profile", (req, res) => {
	const { token } = req.cookies;
	if (token) {
		jwt.verify(token, jwtSecret, {}, (err, userData) => {
			if (err) throw err;
			res.json(userData);
		});
	} else {
		res.status(420).json("No Token");
	}
});

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		const createdUser = await User.create({
			username,
			password,
		});
		jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
			if (err) throw err;
			res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
				id: createdUser._id,
			});
		});
	} catch (err) {
		if (err) throw err;
		res.status(500).json("error");
	}
});

app.listen(3000);
