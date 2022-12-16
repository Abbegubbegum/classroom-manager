<script setup lang="ts">
import { removeFromQueue } from "@/main";
import { ref } from "vue";
import { useStore } from "vuex";
const store = useStore();

// const names = ref([
//   "Albin",
//   "Samuel Broman",
//   "Alexander",
//   "Markus",
//   "Mathias Pusher",
//   "Leo",
//   "Martin Segelius",
// ]);

function getMemberFromStateWithId(memberID: string) {
  return store.state.room.members.find((member: any) => member.id === memberID);
}
</script>

<template>
  <div
    class="grid grid-rows-[auto_1fr] border-b border-l border-r border-gray-300 rounded-lg min-h-full"
  >
    <div
      class="p-3 pb-0 bg-gray-300 flex justify-center items-center border w-full rounded-t-lg"
    >
      <img src="@/assets/question.svg" width="80" alt="" />
    </div>
    <ul class="h-full w-full text-center bg-gray-50 rounded-b-lg">
      <!-- <li
        v-for="name in names"
        class="p-2 bg-white w-full border-b text-3xl hover:text-red-600 hover:line-through cursor-pointer"
      >
        {{ name }}
      </li> -->
      <li
        v-for="memberID in store.state.room.queue"
        class="p-2 bg-white w-full border text-3xl hover:text-red-600 hover:line-through cursor-pointer"
        @click="removeFromQueue($route.params.roomCode as string, memberID)"
      >
        {{ getMemberFromStateWithId(memberID).name }}
      </li>
    </ul>
  </div>
</template>

<style></style>
