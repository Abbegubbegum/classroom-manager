<script setup lang="ts">
import { useRoute } from "vue-router";
import { API_URL, setToken } from "@/main";
import router from "@/router";
import { computed, ref } from "vue";

const route = useRoute();

const roomError = ref(false);

const box1 = ref("");
const box2 = ref("");
const box3 = ref("");
const box4 = ref("");

const roomInput = computed(
  () =>
    box1.value.toUpperCase() +
    box2.value.toUpperCase() +
    box3.value.toUpperCase() +
    box4.value.toUpperCase()
);

const nameInput = ref("");
const nameInputElement = ref(null);

if (route.query.code) {
  const code = route.query.code as string;
  box1.value = code[0];
  box2.value = code[1];
  box3.value = code[2];
  box4.value = code[3];
}

async function createRoom() {
  const headers = new Headers();
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const res = await fetch(API_URL + "/rooms/create", {
    headers,
  });

  const data = await res.json();

  setToken(data.token);

  router.push(`/${data.room.code}/teacher`);
}

async function joinRoom(code: string, name: string) {
  if (code.length !== 4 && name.length < 2) {
    return;
  }

  const params = new URLSearchParams();
  params.set("code", code);
  params.set("name", name);

  const headers = new Headers();
  const token = localStorage.getItem("auth_token");

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const res = await fetch(API_URL + "/rooms/join/?" + params, {
    headers,
  });

  if (res.ok) {
    const data = await res.json();

    if (token !== data.token) {
      setToken(data.token);
    }

    router.push(`/${data.code}/${data.owner ? "teacher" : "student"}`);
  } else {
    const error = await res.text();

    if (error === "Room not found") {
      roomError.value = true;
      setTimeout(() => {
        roomError.value = false;
      }, 700);
    }

    return false;
  }
}

function codeInputBefore(event: any) {
  if (event.key.length === 1 && event.target.value.length === 1) {
    event.target.value = event.key;
    (event.target.dataset.pos !== "last"
      ? event.target.nextElementSibling
      : nameInputElement.value
    ).focus();
  }
  if (event.keyCode === 8 && event.target.value.length === 0) {
    event.target.previousElementSibling.focus();
  }
}

function codeInputAfter(event: any) {
  if (event.key.length === 1) {
    (event.target.dataset.pos !== "last"
      ? event.target.nextElementSibling
      : nameInputElement.value
    ).focus();
  }
}
</script>

<template>
  <div
    class="bg-slate-900 h-full w-full text-white flex flex-col justify-between place-content-center items-center"
  >
    <form
      @submit.prevent="joinRoom(roomInput, nameInput)"
      class="p-10 m-10 flex flex-col justify-around items-center bg-black rounded-lg"
    >
      <div class="flex justify-between items-center gap-3">
        <input
          class="code-box"
          :class="{ error: roomError }"
          minlength="1"
          maxlength="1"
          required
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
          v-model="box1"
          data-pos="first"
        />
        <input
          class="code-box"
          :class="{ error: roomError }"
          minlength="1"
          maxlength="1"
          required
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
          v-model="box2"
        />
        <input
          class="code-box"
          :class="{ error: roomError }"
          minlength="1"
          maxlength="1"
          required
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
          v-model="box3"
        />
        <input
          class="code-box"
          :class="{ error: roomError }"
          minlength="1"
          maxlength="1"
          required
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
          v-model="box4"
          data-pos="last"
        />
      </div>
      <input
        type="text"
        minlength="2"
        maxlength="20"
        ref="nameInputElement"
        v-model="nameInput"
        placeholder="NAME"
        class="w-full p-3 px-5 my-2 mb-12 border-2 border-[#ccc] rounded bg-black text-xl font-semibold"
      />
      <button
        type="submit"
        class="bg-gray-600 p-4 px-8 rounded text-2xl font-bold transition-colors hover:bg-slate-200 hover:text-black"
      >
        JOIN ROOM
      </button>
    </form>
    <button
      type="button"
      class="bg-gray-600 mb-10 p-4 px-8 text-xl rounded-lg transition-colors hover:bg-slate-200 hover:text-black"
      @click="createRoom"
    >
      CREATE ROOM
    </button>
    <div class="sm:order-first">
      <!-- <h1 class="text-5xl font-extrabold text-center my-10">
        Classroom Manager
      </h1> -->
    </div>
  </div>
</template>

<style scoped>
.code-box {
  color: black;
  font-size: 2rem;
  font-weight: bold;
  width: 4rem;
  aspect-ratio: 1 / 1;
  /* border: 1px solid white; */
  background: #bbb;
  text-align: center;
  border-radius: 4px;
  text-transform: uppercase;
}

.error {
  border: 2px solid red;
  animation: shake 0.2s linear 3;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(10px);
  }
  50% {
    transform: translateX(0);
  }
  75% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
