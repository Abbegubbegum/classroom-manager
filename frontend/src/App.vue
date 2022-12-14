<script setup lang="ts"></script>

<template>
  <div class="w-screen h-screen">
    <Suspense>
      <router-view></router-view>

      <template #fallback>
        <div class="w-full h-full text-center">Loading...</div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped></style>
