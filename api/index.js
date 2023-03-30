require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

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

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(12);
mongoose.connect(process.env.MONGODB_URL);

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

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username: username });
	if (user) {
		const passOk = bcrypt.compareSync(password, user.password);
		if (passOk) {
			jwt.sign({ userId: user._id, username }, jwtSecret, {}, (err, token) => {
				if (err) throw err;
				res.cookie("token", token, { sameSite: "none", secure: true }).json({
					id: user._id,
				});
			});
		} else {
			res.status(422).json("password is incorrect");
		}
	} else {
		res.json("not found");
	}
});

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		const createdUser = await User.create({
			username,
			password: bcrypt.hashSync(password, bcryptSalt),
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
