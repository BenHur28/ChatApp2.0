require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const ws = require("ws");

const User = require("./models/User");
const Message = require("./models/Message");

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

const getUserDataFromRequest = async (req) => {
	return new Promise((resolve, reject) => {
		const { token } = req.cookies;
		if (token) {
			jwt.verify(token, jwtSecret, {}, (err, userData) => {
				if (err) throw err;
				resolve(userData);
			});
		} else {
			reject("no token");
		}
	});
};

app.get("/messages/:userId", async (req, res) => {
	const { userId } = req.params;
	const userData = await getUserDataFromRequest(req);
	const ourUserId = userData.userId;
	const messages = await Message.find({
		sender: { $in: [userId, ourUserId] },
		recipient: { $in: [userId, ourUserId] },
	})
		.sort({ createdAt: 1 })
		.exec();
	res.json(messages);
});

app.get("/people", async (req, res) => {
	const users = await User.find({}, { _id: 1, username: 1 });
	res.json(users);
});

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

app.post("/logout", (req, res) => {
	res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
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

const server = app.listen(3000);

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
	const notifyAboutOnlinePeople = () => {
		[...wss.clients].forEach((client) => {
			client.send(
				JSON.stringify({
					online: [...wss.clients].map((c) => ({ userId: c.userId, username: c.username })),
				})
			);
		});
	};

	connection.isAlive = true;

	connection.timer = setInterval(() => {
		connection.ping();
		connection.deathTimer = setTimeout(() => {
			connection.isAlive = false;
			clearInterval(connection.timer);
			connection.terminate();
			notifyAboutOnlinePeople();
		}, 1000);
	}, 5000);

	connection.on("pong", () => {
		clearTimeout(connection.deathTimer);
	});

	// Read username and id from the cookie for this connection
	const cookies = req.headers.cookie;
	if (cookies) {
		const tokenCookieString = cookies.split(";").find((str) => str.startsWith("token="));
		if (tokenCookieString) {
			const token = tokenCookieString.split("=")[1];
			if (token) {
				jwt.verify(token, jwtSecret, {}, (err, userData) => {
					if (err) throw err;
					const { userId, username } = userData;
					connection.userId = userId;
					connection.username = username;
				});
			} else {
				res.status(420).json("No Token");
			}
		}
	}

	connection.on("message", async (message) => {
		const messageData = JSON.parse(message.toString());
		const { recipient, text } = messageData;
		if (recipient && text) {
			const messageDoc = await Message.create({
				sender: connection.userId,
				recipient,
				text,
			});
			[...wss.clients]
				.filter((c) => c.userId === recipient)
				.forEach((c) => c.send(JSON.stringify({ text, sender: connection.userId, recipient, _id: messageDoc._id })));
		}
	});

	// Notify everyone about who is currently(online) connected to the websocket.
	notifyAboutOnlinePeople();
});
