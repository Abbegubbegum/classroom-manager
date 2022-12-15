<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { setRoomConfig } from "@/main";
import ToggleSetting from "./ToggleSetting.vue";
import TextSetting from "./TextSetting.vue";
const store = useStore();
const route = useRoute();
const props = defineProps<{ show: boolean }>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function handleEndTimeInput(e: Event) {
  store.state.room.config.endTime = (e.target as any).valueAsNumber;
  setRoomConfig(route.params.roomCode as string);
}

function formatTime(ms: number, def_val?: string) {
  if (Number.isNaN(ms)) {
    return def_val ? def_val : null;
  } else {
    return [Math.floor(ms / 60 / 60 / 1000), Math.floor(ms / 60 / 1000) % 60]
      .join(":")
      .replace(/\b(\d)\b/g, "0$1");
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="props.show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <ToggleSetting
            label="Queue"
            :value="store.state.room.config.useQueue"
            :disabled="false"
            @change="
              (val) => {
                store.state.room.config.useQueue = val;
                setRoomConfig(route.params.roomCode as string);
              }
            "
          />
          <ToggleSetting
            label="Clock"
            :disabled="false"
            :value="store.state.room.config.showClock"
            @change="
              (val) => {
                store.state.room.config.showClock = val;
                setRoomConfig(route.params.roomCode as string);
              }
            "
          />

          <ToggleSetting
            label="Show Remaining Time"
            :disabled="false"
            :value="store.state.room.config.showRemainingTime"
            @change="(val) => {
            store.state.room.config.showRemainingTime = val;
            setRoomConfig(route.params.roomCode as string);
          }"
          />

          <div class="flex items-center mb-4">
            <label class="text-2xl ml-2">
              <input
                type="time"
                @input="handleEndTimeInput"
                :value="formatTime(store.state.room.config.endTime)"
              />
              End Time
            </label>
          </div>
        </div>
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
