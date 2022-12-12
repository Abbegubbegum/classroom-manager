<script setup lang="ts">
import {
  connectWebSocket,
  getRoomInfo,
  removeFromQueue,
  setToken,
} from "@/main";
import router from "@/router";
import { Socket } from "engine.io-client";
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
    setToken("");
    router.push("/");
  }
}

function getMemberFromStateWithId(memberID: string) {
  return store.state.room.members.find((member: any) => member.id === memberID);
}
</script>

<template>
  <div>
    <div class="p-6">
      <p class="text-3xl">Current Room: {{ $route.params.roomCode }}</p>
      <p class="text-xl mt-3">You Are the Owner!</p>
      <div class="flex">
        <div>
          <p class="text-xl font-bold">Members:</p>
          <ul>
            <li v-for="member in store.state.room.members">
              {{ member.name }}
            </li>
          </ul>
        </div>
        <div class="mx-20">
          <p class="text-xl font-bold">Queue:</p>
          <ul>
            <li
              v-for="memberID in store.state.room.queue"
              class="hover:text-red-600 hover:line-through cursor-pointer"
              @click="
                removeFromQueue($route.params.roomCode as string, memberID)
              "
            >
              {{ getMemberFromStateWithId(memberID).name }}
            </li>
          </ul>
        </div>
      </div>
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
