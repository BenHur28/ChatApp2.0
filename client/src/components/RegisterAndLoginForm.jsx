import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

const RegisterAndLoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoginOrRegister, setIsloginOrRegister] = useState("register");
	const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
	const handleSubmit = async (e) => {
		e.preventDefault();
		const url = isLoginOrRegister === "register" ? "register" : "login";
		const { data } = await axios.post(`/${url}`, {
			username,
			password,
		});
		setLoggedInUsername(username);
		setId(data.id);
	};

	return (
		<div className="bg-blue-50 h-screen flex items-center">
			<form onSubmit={handleSubmit} className="w-64 mx-auto mb-12">
				<input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					type="text"
					placeholder="username"
					className="block w-full rounded-sm p-2 mb-2 border"
				/>
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					placeholder="password"
					className="block w-full rounded-sm p-2 mb-2 border"
				/>
				<button className="bg-blue-500 text-white block w-full rounded-sm p-2">{isLoginOrRegister === "register" ? "Register" : "Login"}</button>
				{isLoginOrRegister === "register" && (
					<div className="text-center mt-2">
						Already a member? <button onClick={() => setIsloginOrRegister("login")}>Login Here</button>
					</div>
				)}
				{isLoginOrRegister === "login" && (
					<div className="text-center mt-2">
						Don't have an account? <button onClick={() => setIsloginOrRegister("register")}>Register</button>
					</div>
				)}
			</form>
		</div>
	);
};

export default RegisterAndLoginForm;
