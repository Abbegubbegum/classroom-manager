<script setup lang="ts">
import { connectWebSocket, getRoomInfo } from "@/main";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useStore } from "vuex";

connectWebSocket();
getRoomInfo(useRoute().params.roomCode as string);

const store = useStore();
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
  </div>
</template>

<style scoped></style>
