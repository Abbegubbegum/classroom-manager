import express from "express";
import { resolve } from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

type Room = {
	ownerID: string;
	code: string;
	memberIDs: Member[];
};

type Member = {
	id: string;
	name: string;
};

let rooms: Room[] = [];

app.use(cors());
app.use(express.json());
app.use(express.static(resolve("../frontend/dist")));

app.get("/rooms/create", (req, res) => {
	const authHeader = req.get("Authorization");

	let token: string | undefined;
	let id: string | undefined;
	let decodedToken: jwt.JwtPayload | undefined;

	if (authHeader) {
		token = parseAuthHeader(authHeader);

		if (token) {
			decodedToken = decodeToken(token);
		}
	}

	if (decodedToken) {
		id = decodedToken.id;
	} else if (!decodedToken) {
		const newToken = createUserToken("1d");
		token = newToken.token;
		id = newToken.id;
	}

	if (!id || !token) {
		return res.sendStatus(500);
	}

	const room = createRoom(id);

	return res.status(201).json({
		token,
		room,
	});
});

app.get("/rooms/join", (req, res) => {
	const roomCode = req.query.code;

	const authHeader = req.get("Authorization");

	if (typeof roomCode !== "string") {
		return res
			.status(400)
			.send("Bad request, Missing room code search parameter");
	}

	const room = rooms.find((room) => room.code === roomCode);

	if (!room) {
		return res.status(404).send("Room not found");
	}

	let token: string | undefined;

	let decodedToken: jwt.JwtPayload | undefined;

	if (authHeader) {
		token = parseAuthHeader(authHeader);

		if (token) {
			decodedToken = decodeToken(token);
		}
	}

	if (!decodedToken) {
		token = createUserToken("1h");
	}

	if (!token) {
		return res.sendStatus(500);
	}

	return res.status(200).json({
		token,
		room: {
			code: room.code,
			owner: room.ownerID === token,
		},
	});
});

app.get("/rooms/exit", (req, res) => {
	const roomCode = req.query.code;

	const authHeader = req.get("Authorization");

	if (typeof roomCode !== "string") {
		return res
			.status(400)
			.send("Bad request, Missing room code search parameter");
	}

	const room = rooms.find((room) => room.code === roomCode);

	let token: string | undefined;

	if (authHeader) {
		token = parseAuthHeader(authHeader);
	}

	if (room?.ownerID == (token ?? "")) {
		rooms.splice(rooms.indexOf(room), 1);
	}

	return res.sendStatus(200);
});

app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});

function generateUID() {
	return Math.random().toString().replace(".", "").substring(0, 8);
}

function generateRoomCode() {
	// Create an array of capital letters and numbers
	const chars = [
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"J",
		"K",
		"L",
		"M",
		"N",
		"P",
		"Q",
		"R",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z",
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
	];

	// Create an empty string to store the room code
	let roomCode = "";

	// Generate a random index for each character in the room code
	for (let i = 0; i < 4; i++) {
		let randIndex = Math.floor(Math.random() * chars.length);
		roomCode += chars[randIndex];
	}

	// Return the generated room code
	return roomCode;
}

function createUserToken(expiresIn: string) {
	const uid = generateUID();

	return {
		token: jwt.sign(
			{
				id: uid,
			},
			JWT_SECRET,
			{
				expiresIn,
			}
		),
		id: uid,
	};
}

function createRoom(ownerID: string) {
	const room: Room = {
		ownerID: ownerID,
		code: generateRoomCode(),
		memberIDs: [],
	};
	rooms.push(room);
	return room;
}

function parseAuthHeader(header: string) {
	// Split the header on the space character to get the parts
	// The format of the header is "Bearer <token>"
	const parts = header.split(" ");

	// Check if the header has the correct number of parts
	if (parts.length !== 2) {
		return undefined;
	}

	// Check if the first part of the header is "Bearer"
	if (parts[0] !== "Bearer") {
		return undefined;
	}

	// Return the token
	return parts[1];
}

function decodeToken(token: string): jwt.JwtPayload | undefined {
	let res: jwt.JwtPayload | string;

	try {
		res = jwt.verify(token, JWT_SECRET);
	} catch (err) {
		console.log(err);
		return undefined;
	}

	if (typeof res !== "string") {
		return res;
	} else {
		console.log(res);
		return undefined;
	}
}
