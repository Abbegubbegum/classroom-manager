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
  auth: {
    token: localStorage.getItem("auth_token"),
  },
});

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("connect_error", () => {
  router.push("/");
  socket.disconnect();
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("ROOM_INFO", (room: Room) => {
  store.state.room = room;
});

socket.on("QUEUE_UPDATE", (queuePosition: number) => {
  store.state.queuePosition = queuePosition;
});

socket.on("REMOVED_BY_OWNER", () => {
  setToken("");
  router.push("/");
});

export function setToken(token: string) {
  socket.disconnect();
  // console.log("Disconnected from server");

  localStorage.setItem("auth_token", token);
  socket.auth = { token: token };
}

export function connectWebSocket() {
  console.log(socket);
  console.log("Connecting TOKEN: " + (socket.auth as any).token);
  socket.connect();

  console.log("Connecting");
  console.log(socket.connected);
  console.log(socket.disconnected);

  return new Promise<void>((resolve, reject) => {
    if (socket.connected) {
      resolve();
    }
    setInterval(() => {
      if (socket.connected) {
        resolve();
      }
    }, 500);
  });
}

export async function getRoomInfo(roomCode: string) {
  await connectWebSocket();

  console.log("Awaited");

  socket.emit("ROOM_INFO", roomCode, (res: any) => {
    if (!res) {
      router.push("/");
      return;
    }

    store.state.room = res;
  });
}

export async function removeMember(memberID: string, roomCode: string) {
  await connectWebSocket();

  socket.emit("OWNER_REMOVE_MEMBER", roomCode, memberID);
}

export async function removeFromQueue(roomCode: string, memberID: string) {
  await connectWebSocket();

  socket.emit("OWNER_REMOVE_FROM_QUEUE", roomCode, memberID);
}

export async function getMemberInfo(roomCode: string) {
  await connectWebSocket();

  console.log("Awaited");

  socket.emit("MEMBER_INFO", roomCode, (res: any) => {
    if (!res) {
      router.push("/");
      return;
    }

    store.state.member.name = res.name;
    store.state.queuePosition = res.queuePosition;
  });
}

export async function joinQueue(roomCode: string) {
  await connectWebSocket();

  socket.emit("JOIN_QUEUE", roomCode, (pos: number | undefined) => {
    if (!pos) {
      router.push("/");
      return;
    }

    store.state.queuePosition = pos;
  });
}

export async function leaveQueue(roomCode: string) {
  await connectWebSocket();

  socket.emit("LEAVE_QUEUE", roomCode);

  store.state.queuePosition = -1;
}
