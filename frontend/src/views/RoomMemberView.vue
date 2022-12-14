<script setup lang="ts">
import { computed } from "vue";
import {
  API_URL,
  connectWebSocket,
  getMemberInfo,
  getRoomConfig,
  joinQueue,
  leaveQueue,
  setToken,
} from "@/main";
import router from "@/router";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
const route = useRoute();
const store = useStore();

await connectWebSocket();
await getMemberInfo(route.params.roomCode as string);
await getRoomConfig(route.params.roomCode as string);

const toggleQueue = computed(() =>
  store.state.queuePosition === -1 ? joinQueue : leaveQueue
);

async function exitRoom() {
  const params = new URLSearchParams();
  params.set("code", route.params.roomCode as string);

  const headers = new Headers();
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const res = await fetch(API_URL + "/rooms/exit/?" + params, {
    headers,
  });

  if (res.ok) {
    setToken("");
    router.push("/");
  }
}
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-center justify-between bg-slate-900 text-white"
  >
    <div class="p-6 text-center">
      <p class="text-4xl font-semibold">
        Current Room: {{ $route.params.roomCode }}
      </p>
      <p class="text-4xl my-3 mb-10">{{ store.state.member.name }}</p>
      <p
        class="text-4xl font-semibold m-1 transition-opacity"
        :class="{
          disabled:
            store.state.queuePosition === -1 || !store.state.room.config.queue,
        }"
      >
        In Queue!
      </p>
      <p
        class="text-3xl transition-opacity"
        :class="{
          disabled:
            store.state.queuePosition === -1 || !store.state.room.config.queue,
        }"
      >
        Queue Position: {{ store.state.queuePosition }}
      </p>
    </div>
    <button
      type="button"
      v-if="store.state.room.config.queue"
      class="bg-green-500 p-6 w-52 m-4 text-xl font-semibold rounded text-black transition-colors hover:text-white"
      :class="{ exitColor: store.state.queuePosition !== -1 }"
      @click="toggleQueue($route.params.roomCode as string)"
    >
      {{ store.state.queuePosition === -1 ? "JOIN QUEUE" : "LEAVE QUEUE" }}
    </button>
    <button
      type="button"
      class="bg-slate-500 p-4 px-6 m-10 mb-52 sm:mb-10 text-xl font-semibold rounded transition-colors hover:bg-slate-200 hover:text-black"
      @click="exitRoom"
    >
      EXIT ROOM
    </button>
  </div>
</template>

<style scoped>
.exitColor {
  background: red;
  color: white;
}

:hover.exitColor {
  background: rgb(138, 0, 0) !important;
}

.disabled {
  opacity: 0;
  transition: none !important;
}
</style>
