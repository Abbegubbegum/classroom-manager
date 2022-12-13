<script setup lang="ts">
import { API_URL, setToken } from "@/main";
import router from "@/router";
import { computed, ref } from "vue";

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
    console.warn(await res.text());
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
  console.dir();
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
    <div>
      <h1 class="text-5xl font-extrabold text-center my-10">
        Classroom Manager
      </h1>
    </div>
    <form
      @submit.prevent="joinRoom"
      class="p-10 flex flex-col justify-around items-center bg-black rounded-lg"
    >
      <div class="flex justify-between items-center gap-3">
        <input
          class="code-box"
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
          minlength="1"
          maxlength="1"
          required
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
          v-model="box2"
        />
        <input
          class="code-box"
          minlength="1"
          maxlength="1"
          required
          @keydown="codeInputBefore"
          @keyup="codeInputAfter"
          v-model="box3"
        />
        <input
          class="code-box"
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
        ref="nameInputElement"
        v-model="nameInput"
        placeholder="NAME"
        class="w-full p-3 px-5 my-2 mb-12 border-2 border-[#ccc] rounded bg-black text-xl font-semibold"
      />
      <button
        type="submit"
        class="bg-gray-600 p-4 px-8 rounded text-2xl font-bold"
      >
        JOIN ROOM
      </button>
    </form>
    <button
      type="button"
      class="bg-gray-600 my-10 p-4 px-8 text-xl rounded-lg"
      @click="createRoom"
    >
      CREATE ROOM
    </button>
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
</style>
