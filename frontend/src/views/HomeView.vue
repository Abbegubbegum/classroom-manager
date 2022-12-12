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

function moveFocusForward(event: any) {
  // event.preventDefault();
  // console.log("FORWARD", event);
  // if (event.inputType !== "deleteContentBackward") {
  //   event.target.nextElementSibling.focus();
  // }
}

function codeInputBefore(event: any) {
  // console.log("FORWARD", event);
  if (event.key.length === 1 && event.target.value.length === 1) {
    event.target.value = event.key;
    event.target.nextElementSibling.focus();
  }
  if (event.keyCode === 8 && event.target.value.length === 0) {
    event.target.previousElementSibling.focus();
  }
}

function codeInputAfter(event: any) {
  // console.log("FORWARD", event);

  if (event.key.length === 1) {
    event.target.nextElementSibling.focus();
  }
}
</script>

<template>
  <div
    class="bg-slate-900 h-full w-full text-white flex flex-col justify-around place-content-center items-center"
  >
    <div>
      <h1 class="text-5xl font-extrabold text-center">Classroom Manager</h1>
    </div>
    <div class="p-6 flex flex-col justify-around">
      <!-- <input
        type="text"
        name="room-id"
        v-model="roomInput"
        placeholder="CODE"
        class="w-48 p-3 px-5 my-2 border-2 border-[#ccc] rounded bg-transparent"
      /> -->

      <div class="flex justify-between items-center gap-3">
        <input
          class="code-box"
          maxlength="1"
          @input="moveFocusForward"
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
        />
        <input
          class="code-box"
          maxlength="1"
          @keydown="codeInputBefore"
          @input="moveFocusForward"
          @keyup="codeInputAfter"
        />
        <input
          class="code-box"
          maxlength="1"
          @keydown="codeInputBefore"
          @input="moveFocusForward"
          @keyup="codeInputAfter"
        />
        <input
          class="code-box"
          maxlength="1"
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
        />
      </div>
      <input
        type="text"
        name="name-input"
        v-model="nameInput"
        placeholder="NAME"
        class="w-48 p-3 px-5 my-2 border-2 border-[#ccc] rounded bg-transparent"
      />
      <button
        type="button"
        class="bg-gray-600 p-2 border border-white"
        @click="joinRoom"
      >
        JOIN ROOM
      </button>
    </div>
    <button
      type="button"
      class="bg-gray-600 p-4 px-8 text-xl border border-white"
      @click="createRoom"
    >
      CREATE ROOM
    </button>
  </div>
</template>

<style scoped>
.code-box {
  width: 3rem;
  aspect-ratio: 1 / 1;
  border: 1px solid white;
  background: transparent;
  text-align: center;
  border-radius: 4px;
  text-transform: uppercase;
}
</style>
