<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  label: string;
  value: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: "change", value: boolean): void;
}>();

function handleInput(e: any) {
  emit("change", e.target.value);
}
</script>
<template>
  <div class="flex items-center mb-4">
    <label class="text-2xl ml-2">
      <input
        type="text"
        :value="props.value"
        :disabled="props.disabled"
        @input="handleInput"
      />
      {{ props.label }}
    </label>
  </div>
</template>

<style scoped></style>
