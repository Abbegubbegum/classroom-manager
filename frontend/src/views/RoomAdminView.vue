<script setup lang="ts">
import { connectWebSocket, getRoomInfo } from "@/main";
import router from "@/router";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
const route = useRoute();
const store = useStore();

connectWebSocket();
getRoomInfo(route.params.roomCode as string);

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
    localStorage.removeItem("auth_token");
    router.push("/");
  }
}
</script>

<template>
  <div>
    <div class="p-6">
      <p class="text-3xl">Current Room: {{ $route.params.roomCode }}</p>
      <p class="text-xl mt-3">You Are the Owner!</p>
      <p class="text-xl font-bold">Members:</p>
      <ul>
        <li v-for="member in store.state.room.members">{{ member.name }}</li>
      </ul>
    </div>

    <div>
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

<style scoped></style>
