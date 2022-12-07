<script setup lang="ts">
import { ref } from "vue";

let roomInput = ref("");
</script>

<template>
  <div class="bg-slate-900 h-full w-full">
    <button
      type="button"
      class="bg-gray-600 p-2 border border-white text-white block"
    >
      CREATE ROOM
    </button>
    <input type="text" name="room-id" v-model="roomInput" />
    <button
      type="button"
      class="bg-gray-600 p-2 border border-white text-white ml-4"
    >
      ENTER ROOM
    </button>
    <button
      type="button"
      class="bg-gray-600 p-2 border border-white text-white block"
    >
      EXIT ROOM
    </button>
  </div>
</template>
