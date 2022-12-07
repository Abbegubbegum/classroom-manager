<script setup lang="ts">
import { ref } from "vue";

const roomInput = ref("");

const currentRoomCode = ref("");

const owner = ref(false);

async function createRoom() {
  const res = await fetch("http://localhost:8080/rooms/create");

  const data = await res.json();

  localStorage.setItem("auth_token", data.token);

  currentRoomCode.value = data.room.code;

  owner.value = true;

  console.log(data);
}

async function joinRoom() {
  if (roomInput.value.length != 4) {
    return;
  }

  const params = new URLSearchParams();
  params.set("code", roomInput.value);

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
      localStorage.setItem("auth_token", data.token);
    }

    currentRoomCode.value = data.room.code;

    owner.value = data.room.owner;
  } else {
    console.warn(await res.text());
  }
}

async function exitRoom() {
  if (currentRoomCode.value.length != 4) {
    return;
  }

  const params = new URLSearchParams();
  params.set("code", currentRoomCode.value);

  const headers = new Headers();
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const res = await fetch("http://localhost:8080/rooms/exit/?" + params, {
    headers,
  });

  if (res.ok) {
    currentRoomCode.value = "";
    localStorage.removeItem("auth_token");
    owner.value = false;
  }
}
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
      <input
        type="text"
        name="room-id"
        v-model="roomInput"
        class="text-black"
      />
      <button
        type="button"
        class="bg-gray-600 p-2 border border-white ml-4"
        @click="joinRoom"
      >
        JOIN ROOM
      </button>
      <button
        type="button"
        class="bg-gray-600 p-2 border border-white block"
        @click="exitRoom"
      >
        EXIT ROOM
      </button>
    </div>
  </div>
</template>
