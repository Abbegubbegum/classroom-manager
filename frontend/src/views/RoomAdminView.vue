<script setup lang="ts">
import {
  connectWebSocket,
  getRoomInfo,
  removeFromQueue,
  setToken,
  removeMember,
  API_URL,
} from "@/main";
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

  const res = await fetch(API_URL + "/rooms/exit/?" + params, {
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
  <div class="w-full h-full flex flex-col justify-start items-center">
    <div class="text-center">
      <h1 class="mt-4 text-5xl font-bold">Room Code:</h1>
      <h1 class="text-5xl font-bold">{{ $route.params.roomCode }}</h1>
    </div>
    <div class="p-6 grid grid-cols-2 w-1/2">
      <div class="flex flex-col justify-start items-center">
        <p class="text-3xl font-bold">Members:</p>
        <ul>
          <li
            v-for="member in store.state.room.members"
            class="text-3xl hover:text-red-600 hover:line-through cursor-pointer"
            @click="removeMember(member.id, $route.params.roomCode as string)"
          >
            {{ member.name }}
          </li>
        </ul>
      </div>
      <div class="flex flex-col justify-start items-center">
        <p class="text-3xl font-bold">Queue:</p>
        <ul>
          <li
            v-for="memberID in store.state.room.queue"
            class="text-3xl hover:text-red-600 hover:line-through cursor-pointer"
            @click="removeFromQueue($route.params.roomCode as string, memberID)"
          >
            {{ getMemberFromStateWithId(memberID).name }}
          </li>
        </ul>
      </div>
    </div>
    <button
      type="button"
      class="sm:absolute sm:left-0 sm:top-0 bg-transparent border-2 border-black rounded p-3 px-6 m-4 text-lg transition-colors hover:bg-gray-600 hover:text-white hover:border-white"
      @click="exitRoom"
    >
      EXIT ROOM
    </button>
  </div>
</template>

<style scoped></style>
