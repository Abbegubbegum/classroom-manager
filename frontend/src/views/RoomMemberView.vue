<script setup lang="ts">
import { computed } from "vue";
import {
  connectWebSocket,
  getMemberInfo,
  joinQueue,
  leaveQueue,
  setToken,
} from "@/main";
import router from "@/router";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
const route = useRoute();
const store = useStore();

connectWebSocket();
getMemberInfo(route.params.roomCode as string);

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

  const res = await fetch("http://localhost:8080/rooms/exit/?" + params, {
    headers,
  });

  if (res.ok) {
    setToken("");
    router.push("/");
  }
}
</script>

<template>
  <div class="h-full bg-slate-900 text-white">
    <div class="p-6">
      <p class="text-3xl">Current Room: {{ $route.params.roomCode }}</p>
      <p class="text-xl">Name: {{ store.state.member.name }}</p>
      <p class="text-xl" v-if="store.state.queuePosition !== -1">
        Queue Position: {{ store.state.queuePosition }}
      </p>
    </div>
    <div>
      <button
        type="button"
        class="bg-green-500 p-3 m-4 hover:text-black"
        :class="{ exitColor: store.state.queuePosition !== -1 }"
        @click="toggleQueue($route.params.roomCode as string)"
      >
        {{ store.state.queuePosition === -1 ? "JOIN QUEUE" : "LEAVE QUEUE" }}
      </button>
      <button
        type="button"
        class="bg-slate-500 p-3 m-4 hover:bg-slate-200 hover:text-black"
        @click="exitRoom"
      >
        EXIT ROOM
      </button>
    </div>
  </div>
</template>

<style scoped>
.exitColor {
  background: red !important;
}
</style>
