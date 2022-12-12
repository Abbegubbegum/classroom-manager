<script setup lang="ts">
import { setToken } from "@/main";
import router from "@/router";
import { ref } from "vue";

const roomInput = ref("");
const nameInput = ref("");

async function createRoom() {
  const headers = new Headers();
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const res = await fetch("http://localhost:8080/rooms/create", {
    headers,
  });

  const data = await res.json();

  setToken(data.token);

  router.push(`/${data.room.code}/teacher`);
}

async function joinRoom() {
  if (roomInput.value.length !== 4 && nameInput.value.length < 2) {
    return;
  }

  const params = new URLSearchParams();
  params.set("code", roomInput.value);
  params.set("name", nameInput.value);

  const headers = new Headers();
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const res = await fetch("http://localhost:8080/rooms/join/?" + params, {
    headers,
  });

  if (res.ok) {
    const data = await res.json();

    if (token !== data.token) {
      setToken(data.token);
    }

    if (data.room.owner) {
      router.push(`/${data.room.code}/teacher`);
    } else {
      router.push(`/${data.room.code}/student`);
    }
  } else {
    console.warn(await res.text());
  }
}

/*

*/
</script>

<template>
  <div class="bg-slate-900 h-full w-full flex justify-around text-white">
    <div class="p-6">
      <button
        type="button"
        class="bg-gray-600 p-2 border border-white block"
        @click="createRoom"
      >
        CREATE ROOM
      </button>
      <span>
        <input
          type="text"
          name="room-id"
          v-model="roomInput"
          placeholder="CODE"
          class="text-black"
        />
        <input
          type="text"
          name="name-input"
          v-model="nameInput"
          placeholder="NAME"
          class="text-black"
        />
      </span>
      <button
        type="button"
        class="bg-gray-600 p-2 border border-white ml-4"
        @click="joinRoom"
      >
        JOIN ROOM
      </button>
      <!-- <button
        type="button"
        class="bg-gray-600 p-2 border border-white block"
        @click="exitRoom"
      >
        EXIT ROOM
      </button> -->
    </div>
  </div>
</template>
