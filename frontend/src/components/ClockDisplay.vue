<script setup lang="ts">
import { ref } from "vue";

const time = ref(new Date());

const firstDelay = 1000 - time.value.getMilliseconds();

setTimeout(() => {
  time.value = new Date();
  setInterval(() => {
    time.value = new Date();
  }, 1000);
}, firstDelay);
</script>

<template>
  <div>{{ time.toLocaleTimeString() }}</div>
</template>
