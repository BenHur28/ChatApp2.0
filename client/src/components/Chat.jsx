import React, { useEffect, useState } from "react";

const Chat = () => {
	const [ws, setWs] = useState(null);
	const [onlinePeople, setOnlinePeople] = useState({});
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:3000");
		setWs(ws);
		ws.addEventListener("message", handleMessage);
	}, []);

	const showOnlinePoeple = (peopleArray) => {
		const people = {};
		peopleArray.forEach(({ userId, username }) => {
			people[userId] = username;
		});
		setOnlinePeople(people);
	};

	const handleMessage = (e) => {
		const messageData = JSON.parse(e.data);
		if ("online" in messageData) {
			showOnlinePoeple(messageData.online);
		}
	};

	return (
		<div className="flex h-screen">
			<div className="bg-white w-1/3">
				{Object.keys(onlinePeople).map((userId) => (
					<div key={userId}>{onlinePeople[userId]}</div>
				))}
			</div>
			<div className="flex flex-col bg-blue-100 w-2/3 p-2">
				<div className="flex-grow"> messages with select person</div>
				<div className="flex gap-2">
					<input className="bg-white border flex-grow p-2 rounded-sm" type="text" placeholder="Type your message here" />
					<button className="bg-blue-500 text-white p-2 rounded-sm">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Chat;
