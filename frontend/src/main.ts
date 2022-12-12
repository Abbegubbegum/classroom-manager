import { createApp } from "vue";
import { createStore } from "vuex";
import App from "./App.vue";
import router from "./router";
import { io } from "socket.io-client";
import "./assets/main.css";

export type Room = {
  code: string;
  members: Member[];
  queue: number[];
};

type Member = {
  name: string;
  id: string;
};

const app = createApp(App);

const store = createStore({
  state() {
    return {
      room: {} as Room,
      member: {} as Member,
      queuePosition: -1,
    };
  },
});

app.use(router);
app.use(store);

app.mount("#app");

const socket = io("http://localhost:8080", {
  autoConnect: false,
  auth: () => {
    return {
      token: localStorage.getItem("auth_token"),
    };
  },
});

socket.on("connection", () => {
  console.log("Connected to server");
});

socket.on("connect_error", () => {
  router.push("/");
  socket.disconnect();
});

socket.on("ROOM_INFO", (room: Room) => {
  store.state.room = room;
});

socket.on("QUEUE_UPDATE", (queuePosition: number) => {
  store.state.queuePosition = queuePosition;
});

export function setToken(token: string) {
  if (socket.connected) {
    socket.disconnect();
    // console.log("Disconnected from server");
  }

  localStorage.setItem("auth_token", token);
  socket.auth = { token: token };
}

export function connectWebSocket() {
  // console.log("Connecting TOKEN: " + (socket.auth as any).token);
  socket.connect();
}

export function getRoomInfo(roomCode: string) {
  socket.connect();

  socket.emit("ROOM_INFO", roomCode, (res: any) => {
    if (!res) {
      router.push("/");
      return;
    }

    store.state.room = res;
  });
}

export function removeFromQueue(roomCode: string, memberID: string) {
  socket.connect();

  socket.emit("OWNER_REMOVE_FROM_QUEUE", roomCode, memberID);
}

export function getMemberInfo(roomCode: string) {
  socket.connect();

  socket.emit("MEMBER_INFO", roomCode, (res: any) => {
    if (!res) {
      router.push("/");
      return;
    }

    store.state.member.name = res.name;
    store.state.queuePosition = res.queuePosition;
  });
}

export function joinQueue(roomCode: string) {
  socket.connect();

  socket.emit("JOIN_QUEUE", roomCode, (pos: number | undefined) => {
    if (!pos) {
      return;
    }

    store.state.queuePosition = pos;
  });
}

export function leaveQueue(roomCode: string) {
  socket.connect();

  socket.emit("LEAVE_QUEUE", roomCode);

  store.state.queuePosition = -1;
}
