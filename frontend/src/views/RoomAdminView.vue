<script setup lang="ts">
import { connectWebSocket, getRoomInfo, setToken, API_URL } from "@/main";
import router from "@/router";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import QRCode from "qrcode";
import TimeDisplay from "@/components/ClockDisplay.vue";
import RemainingTimeDisplay from "@/components/RemainingTimeDisplay.vue";
import QueueList from "@/components/QueueList.vue";
import SettingsDialog from "@/components/Settings/SettingsDialog.vue";
const route = useRoute();
const store = useStore();

await connectWebSocket();
await getRoomInfo(route.params.roomCode as string);

const showSettings = ref(false);

onMounted(() => {
  createQRCode();
});

function createQRCode() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  QRCode.toCanvas(
    canvas,
    window.location.origin + "/#/?code=" + route.params.roomCode,
    {
      width: canvas.width,
    },
    (err) => {
      if (err) console.error(err);
    }
  );
}

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
  <div class="w-full min-h-full grid grid-cols-3 grid-rows-[20vh_1fr]">
    <button
      type="button"
      class="w-fit h-fit bg-transparent border-2 border-black rounded p-3 px-6 m-4 text-lg transition-colors hover:bg-gray-600 hover:text-white hover:border-white"
      @click="exitRoom"
    >
      DELETE ROOM
    </button>

    <div class="col-start-2">
      <TimeDisplay
        class="m-3 text-8xl font-semibold flex whitespace-nowrap justify-center"
        v-if="store.state.room.config.showClock"
      />

      <RemainingTimeDisplay
        v-if="store.state.room.config.showRemainingTime"
        :target="store.state.room.config.endTime ?? NaN"
        class="mt-6 text-5xl font-semibold flex flex-col items-center whitespace-nowrap"
      />
    </div>

    <button
      class="w-fit h-fit p-4 ml-auto text-5xl transition-transform gearButton z-20 col-start-3"
      @click="showSettings = !showSettings"
    >
      ⚙️
    </button>

    <div class="row-start-2 p-6 min-h-full">
      <QueueList v-if="store.state.room.config.useQueue" />
    </div>

    <div
      class="m-6 mb-[10vh] text-center flex flex-col items-center justify-end row-start-2"
    >
      <canvas id="canvas" class="aspect-square"></canvas>
      <h1 class="text-6xl font-semibold">{{ $route.params.roomCode }}</h1>
    </div>
  </div>
  <SettingsDialog :show="showSettings" @close="showSettings = false" />
</template>

<!-- <div class="p-6 sm:grid sm:grid-cols-2 sm:w-1/2">
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
      </div> --->

<style scoped>
.gearButton {
  transform-origin: top right;
}

:hover.gearButton {
  transform: scale(1.5);
}
</style>
