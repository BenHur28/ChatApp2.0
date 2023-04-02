import React from "react";
import Avatar from "./Avatar";

const Person = ({ id, onClick, selected, username, online }) => {
	return (
		<div onClick={() => onClick(id)} className={"flex items-center gap-2 border-b border-gray-100 cursor-pointer" + (selected ? " bg-blue-100" : "")}>
			{selected && <div className="w-1 h-12 bg-blue-500 rounded-r-md"></div>}
			<div className="flex gap-2 py-2 pl-4 items-center">
				<Avatar online={online} username={username} userId={id} />
				<span className="text-gray-800">{username}</span>
			</div>
		</div>
	);
};

export default Person;
