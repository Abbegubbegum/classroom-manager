import express from "express";
import { resolve } from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import ms from "ms";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
let rooms = [];
let socketids = new Map();
app.use(cors());
app.use(express.json());
app.use(express.static(resolve("./views")));
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // console.log(token);
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
        const err = new Error("Not Authorized");
        next(err);
        return;
    }
    socketids.set(decodedToken.id, socket.id);
    next();
});
io.on("connection", (socket) => {
    // console.log("Connected " + socket.id);
    socket.on("ROOM_INFO", (code, cb) => {
        var _a;
        const token = socket.handshake.auth.token;
        const room = rooms.find((room) => room.code === code);
        const decodedToken = decodeToken(token);
        // console.log(token);
        // console.log(room);
        if ((room === null || room === void 0 ? void 0 : room.ownerID) == ((_a = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id) !== null && _a !== void 0 ? _a : "")) {
            cb(room);
        }
        else {
            cb(undefined);
        }
    });
    socket.on("OWNER_REMOVE_MEMBER", (code, memberID) => {
        const token = socket.handshake.auth.token;
        const room = rooms.find((room) => room.code === code);
        const decodedToken = decodeToken(token);
        // console.log(decodedToken);
        // console.log(room?.ownerID);
        if (!room ||
            !decodedToken ||
            room.ownerID !== decodedToken.id) {
            return;
        }
        const index = room.members.findIndex((member) => member.id === memberID);
        if (index >= 0) {
            room.members.splice(index, 1);
        }
        removeMemberFromQueue(memberID, room);
        emitRemovalToMember(memberID);
        emitRoomInfoToRoomOwner(room);
    });
    socket.on("OWNER_REMOVE_FROM_QUEUE", (code, memberID) => {
        const token = socket.handshake.auth.token;
        const room = rooms.find((room) => room.code === code);
        const decodedToken = decodeToken(token);
        if (!room ||
            !decodedToken ||
            room.ownerID !== decodedToken.id) {
            return;
        }
        removeMemberFromQueue(memberID, room);
    });
    socket.on("MEMBER_INFO", (code, cb) => {
        const token = socket.handshake.auth.token;
        const decodedToken = decodeToken(token);
        const room = rooms.find((room) => room.code === code);
        if (!decodedToken || !room) {
            cb(undefined);
            return;
        }
        const member = getMemberFromId(decodedToken.id, room);
        if (!member) {
            cb(undefined);
            return;
        }
        const queuePos = room.queue.findIndex((id) => id === member.id);
        cb({
            name: member.name,
            queuePosition: queuePos === -1 ? -1 : queuePos + 1,
        });
    });
    socket.on("JOIN_QUEUE", (code, cb) => {
        const token = socket.handshake.auth.token;
        const decodedToken = decodeToken(token);
        const room = rooms.find((room) => room.code === code);
        if (!decodedToken || !room) {
            cb(undefined);
            return;
        }
        const member = getMemberFromId(decodedToken.id, room);
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
    });
    socket.on("LEAVE_QUEUE", (code) => {
        const token = socket.handshake.auth.token;
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
    let token;
    let id;
    let decodedToken;
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
    let token;
    let id;
    let decodedToken;
    if (authHeader) {
        token = parseAuthHeader(authHeader);
        if (token) {
            decodedToken = decodeToken(token);
        }
    }
    // console.log(decodedToken?.id);
    if (decodedToken) {
        id = decodedToken.id;
    }
    else {
        const { token: newToken, data } = createUser("", "5h");
        id = data.id;
        token = newToken;
    }
    if (!id || !token) {
        return res.sendStatus(500);
    }
    // console.log(id);
    const oldRoomIndex = rooms.findIndex((room) => room.ownerID === id);
    if (oldRoomIndex >= 0) {
        rooms.splice(oldRoomIndex, 1);
    }
    const room = createRoom(id, "5h");
    // console.log(rooms);
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
    let member;
    if (decodedToken) {
        if (decodedToken.id === room.ownerID) {
            return res.status(200).json({
                token,
                owner: true,
                code: room.code,
            });
        }
        member = getMemberFromId(decodedToken.id, room);
    }
    if (!member) {
        const { token: newToken, data } = createUser(name, "3h");
        token = newToken;
        member = data;
        addMemberToRoom(member, room);
    }
    if (!token || !member) {
        return res.sendStatus(500);
    }
    return res.status(200).json({
        token,
        owner: false,
        code: room.code,
    });
});
app.get("/rooms/exit", (req, res) => {
    var _a;
    const roomCode = req.query.code;
    const token = parseAuthHeader(req.get("Authorization"));
    if (typeof roomCode !== "string") {
        return res
            .status(400)
            .send("Bad request, Missing room code search parameter");
    }
    const room = rooms.find((room) => room.code === roomCode);
    const decodedToken = decodeToken(token);
    if ((room === null || room === void 0 ? void 0 : room.ownerID) === ((_a = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id) !== null && _a !== void 0 ? _a : "")) {
        rooms.splice(rooms.indexOf(room), 1);
        return res.sendStatus(200);
    }
    if (decodedToken && room) {
        const index = room.members.findIndex((member) => member.id === decodedToken.id);
        if (index >= 0) {
            room.members.splice(index, 1);
        }
        removeMemberFromQueue(decodedToken.id, room);
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
function createUser(name, tokenExpiresIn) {
    const id = generateUID();
    const token = createToken(id, tokenExpiresIn);
    return {
        token,
        data: {
            id,
            name,
        },
    };
}
function createToken(id, expiresIn) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn });
}
function createRoom(ownerID, expiresIn) {
    const room = {
        ownerID: ownerID,
        code: generateRoomCode(),
        members: [],
        queue: [],
        expiresAt: Date.now() + ms(expiresIn),
    };
    rooms.push(room);
    return room;
}
function parseAuthHeader(header) {
    if (!header)
        return undefined;
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
function decodeToken(token) {
    let res;
    if (!token)
        return undefined;
    try {
        res = jwt.verify(token, JWT_SECRET);
    }
    catch (err) {
        // console.log(err);
        return undefined;
    }
    if (typeof res !== "string") {
        return res;
    }
    else {
        // console.log(res);
        return undefined;
    }
}
function nameIsInvalid(name) {
    return name.length < 1;
}
function getMemberFromId(id, room) {
    return room.members.find((member) => member.id === id);
}
function getSocketIdFromId(id) {
    return socketids.get(id);
}
function addMemberToRoom(member, room) {
    room.members.push(member);
    emitRoomInfoToRoomOwner(room);
}
function addMemberToQueue(member, room) {
    const newLength = room.queue.push(member.id);
    emitRoomInfoToRoomOwner(room);
    return newLength;
}
function removeMemberFromQueue(memberID, room) {
    const spliceIndex = room.queue.indexOf(memberID);
    if (spliceIndex === -1)
        return;
    room.queue.splice(spliceIndex, 1);
    emitRoomInfoToRoomOwner(room);
    emitQueueUpdateToMember(-1, memberID);
    for (let i = spliceIndex; i < room.queue.length; i++) {
        emitQueueUpdateToMember(i, room.queue[i]);
    }
}
function emitQueueUpdateToMember(index, memberID) {
    const socketId = getSocketIdFromId(memberID);
    if (socketId) {
        io.to(socketId).emit("QUEUE_UPDATE", index === -1 ? -1 : index + 1);
    }
}
function emitRemovalToMember(memberID) {
    const socketId = getSocketIdFromId(memberID);
    if (socketId) {
        io.to(socketId).emit("REMOVED_BY_OWNER");
    }
}
function emitRoomInfoToRoomOwner(room) {
    const socketId = getSocketIdFromId(room.ownerID);
    if (socketId) {
        io.to(socketId).emit("ROOM_INFO", room);
    }
}
