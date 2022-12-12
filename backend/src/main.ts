import express from "express";
import { resolve } from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import ms from "ms";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
	},
});
const port = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

type Room = {
	ownerID: string;
	expiresAt: number;
	code: string;
	members: Member[];
	queue: string[];
};

type Member = {
	id: string;
	name: string;
};

let rooms: Room[] = [];
let socketids = new Map<string, string>();

app.use(cors());
app.use(express.json());
app.use(express.static(resolve("../frontend/dist")));

io.use((socket, next) => {
	const token = socket.handshake.auth.token as string;

	const decodedToken = decodeToken(token);

	if (!decodedToken) {
		const err = new Error("Not Authorized");
		next(err);
		return;
	}

	socketids.set(decodedToken.id as string, socket.id);
	next();
});

io.on("connection", (socket) => {
	// console.log("Connected " + socket.id);

	socket.on("ROOM_INFO", (code: string, cb: (res: Room | any) => void) => {
		const token = socket.handshake.auth.token as string;

		const room = rooms.find((room) => room.code === code);

		const decodedToken = decodeToken(token);

		// console.log(token);
		// console.log(room);

		if (room?.ownerID == ((decodedToken?.id as string) ?? "")) {
			cb(room);
		} else {
			cb(undefined);
		}
	});

	socket.on("OWNER_REMOVE_FROM_QUEUE", (code: string, memberID: string) => {
		const token = socket.handshake.auth.token as string;

		const room = rooms.find((room) => room.code === code);

		const decodedToken = decodeToken(token);

		if (
			!room ||
			!decodedToken ||
			room.ownerID !== (decodedToken.id as string)
		) {
			return;
		}

		removeMemberFromQueue(memberID, room);
	});

	socket.on(
		"MEMBER_INFO",
		(code: string, cb: (res: any | undefined) => void) => {
			const token = socket.handshake.auth.token as string;

			const decodedToken = decodeToken(token);

			const room = rooms.find((room) => room.code === code);

			if (!decodedToken || !room) {
				cb(undefined);
				return;
			}

			const member = getMemberFromId(decodedToken.id as string, room);

			if (!member) {
				cb(undefined);
				return;
			}

			const queuePos = room.queue.findIndex((id) => id === member.id);

			cb({
				name: member.name,
				queuePosition: queuePos === -1 ? -1 : queuePos + 1,
			});
		}
	);

	socket.on(
		"JOIN_QUEUE",
		(code: string, cb: (place: number | undefined) => void) => {
			const token = socket.handshake.auth.token as string;

			const decodedToken = decodeToken(token);

			const room = rooms.find((room) => room.code === code);

			if (!decodedToken || !room) {
				cb(undefined);
				return;
			}

			const member = getMemberFromId(decodedToken.id as string, room);

			if (!member) {
				cb(undefined);
				return;
			}

			const existingQueuespot = room.queue.find((id) => id === member.id);

			if (existingQueuespot) {
				cb(undefined);
				return;
			}

			const newLength = addMemberToQueue(member, room);

			cb(newLength);
		}
	);

	socket.on("LEAVE_QUEUE", (code: string) => {
		const token = socket.handshake.auth.token as string;

		const decodedToken = decodeToken(token);

		const room = rooms.find((room) => room.code === code);

		if (!decodedToken || !room) {
			return;
		}

		removeMemberFromQueue(decodedToken.id, room);
	});
});

app.get("/rooms/status", (req, res) => {
	const roomCode = req.query.code;
	const authHeader = req.get("Authorization");

	if (typeof roomCode !== "string") {
		return res
			.status(400)
			.send("Bad Request, invalid/missing room code search parameter");
	}

	const room = rooms.find((room) => room.code === roomCode);

	if (!room) {
		return res.status(404).send("Room not found");
	}

	let token: string | undefined;
	let id: string | undefined;
	let decodedToken: jwt.JwtPayload | undefined;

	if (authHeader) {
		token = parseAuthHeader(authHeader);

		if (token) {
			decodedToken = decodeToken(token);
		}
	}

	if (!decodedToken) {
		return res.sendStatus(403);
	}

	id = decodedToken.id;

	if (room.ownerID === id) {
		return res.status(200).json({
			level: "teacher",
		});
	}

	const member = room.members.find((member) => member.id === id);

	if (member) {
		return res.status(200).json({
			level: "student",
		});
	}

	res.sendStatus(403);
});

app.get("/rooms/create", (req, res) => {
	const authHeader = req.get("authorization");

	let token: string | undefined;
	let id: string | undefined;
	let decodedToken: jwt.JwtPayload | undefined;

	if (authHeader) {
		token = parseAuthHeader(authHeader);

		if (token) {
			decodedToken = decodeToken(token);
		}
	}

	console.log(decodedToken?.id);

	if (decodedToken) {
		id = decodedToken.id;
	} else {
		const { token: newToken, data } = createUser("", "5h");

		id = data.id;
		token = newToken;
	}

	if (!id || !token) {
		return res.sendStatus(500);
	}

	console.log(id);

	const oldRoomIndex = rooms.findIndex((room) => room.ownerID === id);

	if (oldRoomIndex >= 0) {
		rooms.splice(oldRoomIndex, 1);
	}

	const room = createRoom(id, "5h");

	console.log(rooms);

	return res.status(201).json({
		token,
		room,
	});
});

app.get("/rooms/join", (req, res) => {
	const roomCode = req.query.code;
	const name = req.query.name;

	let token = parseAuthHeader(req.get("Authorization"));

	if (typeof roomCode !== "string") {
		return res
			.status(400)
			.send("Bad request, Invalid/Missing room code search parameter");
	}

	if (typeof name !== "string") {
		return res
			.status(400)
			.send("Bad request, Invalid/Missing name search parameter");
	}

	if (nameIsInvalid(name)) {
		return res.status(400).send("Name is not valid");
	}

	const room = rooms.find((room) => room.code === roomCode);

	if (!room) {
		return res.status(404).send("Room not found");
	}

	const decodedToken = decodeToken(token);

	let member: Member | undefined;

	if (decodedToken) {
		member = getMemberFromId(decodedToken.id, room);
	}

	if (!member) {
		const { token: newToken, data } = createUser(name, "3h");

		token = newToken;
		member = data;
	}

	if (!token || !member) {
		return res.sendStatus(500);
	}

	if (room.ownerID === member.id) {
		return res.status(200).json({
			token,
			room: {
				code: room.code,
				owner: true,
				members: room.members,
			},
		});
	} else {
		addMemberToRoom(member, room);

		return res.status(200).json({
			token,
			room: {
				code: room.code,
				owner: false,
			},
		});
	}
});

app.get("/rooms/exit", (req, res) => {
	const roomCode = req.query.code;

	const token: string | undefined = parseAuthHeader(req.get("Authorization"));

	if (typeof roomCode !== "string") {
		return res
			.status(400)
			.send("Bad request, Missing room code search parameter");
	}

	const room = rooms.find((room) => room.code === roomCode);

	const decodedToken = decodeToken(token);

	if (room?.ownerID === ((decodedToken?.id as string) ?? "")) {
		rooms.splice(rooms.indexOf(room), 1);
		return res.sendStatus(200);
	}

	if (decodedToken && room) {
		const index = room.members.findIndex(
			(member) => member.id === (decodedToken.id as string)
		);

		if (index >= 0) {
			room.members.splice(index, 1);
		}

		const queueindex = room.queue.findIndex(
			(id) => id === (decodedToken.id as string)
		);

		if (queueindex >= 0) {
			room.queue.splice(queueindex, 1);
		}

		emitRoomInfoToRoomOwner(room);
	}

	return res.sendStatus(200);
});

httpServer.listen(port, () => {
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

function createUser(name: string, tokenExpiresIn: string) {
	const id = generateUID();

	const token = createToken(id, tokenExpiresIn);

	return {
		token,
		data: {
			id,
			name,
		} as Member,
	};
}

function createToken(id: string, expiresIn: string) {
	return jwt.sign({ id }, JWT_SECRET, { expiresIn });
}

function createRoom(ownerID: string, expiresIn: string) {
	const room: Room = {
		ownerID: ownerID,
		code: generateRoomCode(),
		members: [],
		queue: [],
		expiresAt: Date.now() + ms(expiresIn),
	};
	rooms.push(room);
	return room;
}

function parseAuthHeader(header: string | undefined) {
	if (!header) return undefined;

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

function decodeToken(token: string | undefined): jwt.JwtPayload | undefined {
	let res: jwt.JwtPayload | string;

	if (!token) return undefined;

	try {
		res = jwt.verify(token, JWT_SECRET);
	} catch (err) {
		// console.log(err);
		return undefined;
	}

	if (typeof res !== "string") {
		return res;
	} else {
		console.log(res);
		return undefined;
	}
}

function nameIsInvalid(name: string) {
	return name.length < 1;
}

function getMemberFromId(id: string, room: Room) {
	return room.members.find((member) => member.id === id);
}

function getSocketIdFromId(id: string) {
	return socketids.get(id);
}

function addMemberToRoom(member: Member, room: Room) {
	room.members.push(member);

	emitRoomInfoToRoomOwner(room);
}

function addMemberToQueue(member: Member, room: Room): number {
	const newLength = room.queue.push(member.id);

	emitRoomInfoToRoomOwner(room);

	return newLength;
}

function removeMemberFromQueue(memberID: string, room: Room) {
	const spliceIndex = room.queue.indexOf(memberID);

	room.queue.splice(spliceIndex, 1);

	emitRoomInfoToRoomOwner(room);

	emitQueueUpdateToMember(-1, memberID);

	for (let i = spliceIndex; i < room.queue.length; i++) {
		emitQueueUpdateToMember(i, room.queue[i]);
	}
}

function emitQueueUpdateToMember(index: number, memberID: string) {
	const socketId = getSocketIdFromId(memberID);

	if (socketId) {
		io.to(socketId).emit("QUEUE_UPDATE", index === -1 ? -1 : index + 1);
	}
}

function emitRoomInfoToRoomOwner(room: Room) {
	const socketId = getSocketIdFromId(room.ownerID);

	if (socketId) {
		io.to(socketId).emit("ROOM_INFO", room);
	}
}
