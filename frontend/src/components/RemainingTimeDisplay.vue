<script setup lang="ts">
import { defineProps, computed, ref } from "vue";

const props = defineProps<{
  target: number;
}>();

const now = new Date();
let ms = ref(
  now.getHours() * 3600000 +
    now.getMinutes() * 60000 +
    now.getSeconds() * 1000 +
    now.getMilliseconds()
);
const firstDelay = 1000 - now.getMilliseconds();

setTimeout(() => {
  ms.value += firstDelay;
  setInterval(() => {
    ms.value += 1000;
  }, 1000);
}, firstDelay);

const remainingHours = computed(() =>
  Math.floor((props.target - ms.value) / 3600000)
);
const remainingMinutes = computed(
  () => Math.floor((props.target - ms.value) / 60000) % 60
);
const remainingSeconds = computed(
  () => Math.floor((props.target - ms.value) / 1000) % 60
);

const timeLabel = computed(() => {
  let timeArray: Label[] = [
    {
      label: "Hour",
      value: remainingHours.value,
    },
    {
      label: "Minute",
      value: remainingMinutes.value,
    },
    {
      label: "Second",
      value: remainingSeconds.value,
    },
  ];

  timeArray = timeArray.filter((label) => label.value !== 0);

  let labels = timeArray.map(
    (label) =>
      label.value + " " + (label.value === 1 ? label.label : label.label + "s")
  );

  let result = "";

  for (let i = 0; i < labels.length; i++) {
    result += labels[i];
    if (i < labels.length - 2) {
      result += ", ";
    } else if (i === labels.length - 2) {
      result += " and ";
    }
  }

  return result;
});

const labelFirstRow = computed(() => timeLabel.value.split(" and")[0]);

const labelSecondRow = computed(() =>
  timeLabel.value.includes("and")
    ? "and " + timeLabel.value.split("and ")[1]
    : ""
);
type Label = {
  label: string;
  value: number;
};
</script>

<template>
  <div>
    <div>Time Remaining:</div>
    <div v-if="!Number.isNaN(target)">{{ labelFirstRow }}</div>
    <div v-if="!Number.isNaN(target)">
      {{ labelSecondRow }}
    </div>
  </div>
</template>

<style></style>
