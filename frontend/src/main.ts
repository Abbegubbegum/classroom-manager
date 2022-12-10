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
      member: {} as any,
      queuePosition: -1,
    };
  },
});

app.use(router);
app.use(store);

app.mount("#app");

const socket = io("http://localhost:8080", {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: localStorage.getItem("auth_token") });
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

export function connectWebSocket() {
  if (!socket.connected) socket.connect();
}

export function getRoomInfo(roomCode: string) {
  if (!socket.connected) connectWebSocket();

  socket.emit("ROOM_INFO", roomCode, (res: any) => {
    if (!res) {
      router.push("/");
      return;
    }

    store.state.room = res;
  });
}

export function removeFromQueue(roomCode: string, memberID: string) {
  if (!socket.connected) connectWebSocket();

  socket.emit("OWNER_REMOVE_FROM_QUEUE", roomCode, memberID);
}

export function getMemberInfo(roomCode: string) {
  if (!socket.connected) connectWebSocket();

  socket.emit("MEMBER_INFO", roomCode, (res: any) => {
    if (!res) {
      router.push("/");
      return;
    }

    store.state.member = res;
  });
}

export function joinQueue(roomCode: string) {
  if (!socket.connected) connectWebSocket();

  socket.emit("JOIN_QUEUE", roomCode, (pos: number | undefined) => {
    if (!pos) {
      return;
    }

    store.state.queuePosition = pos;
  });
}
