import express from "express";
import { resolve } from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 8080;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

let rooms = [];

app.use(cors());
app.use(express.json());
app.use(express.static(resolve("../frontend/dist")));

app.get("/room/create", (req, res) => {});

app.listen(port, () => {
	console.log(`App listening on http://localhost:${port}`);
});

function createToken() {
	const token = jwt.sign({}, JWT_SECRET);
}

function createRoom() {}
