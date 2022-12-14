<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <Transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: background 0.3s ease;
}

.modal-wrapper {
  position: fixed;
  height: 100%;
  width: 40%;
  top: 0;
  right: 0;
}

.modal-container {
  padding: 2rem;
  background-color: #fff;
  height: 100%;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */
.modal-enter-from,
.modal-leave-to {
  background-color: rgba(0, 0, 0, 0);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateX(100%);
}
</style>
