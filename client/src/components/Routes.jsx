import React, { useContext } from "react";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";
import { UserContext } from "./UserContext";

const Routes = () => {
	const { username, id } = useContext(UserContext);

	if (username) {
		return <Chat />;
	}

	return <RegisterAndLoginForm />;
};

export default Routes;
