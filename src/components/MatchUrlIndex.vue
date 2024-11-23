<template>
  <div>
    <template v-for="(item, index) in state.indexs" :key="index">
      <div class="row">
        <q-input v-model="item.start" type="text" label="Start" class="col" />
        <q-input v-model="item.end" type="text" label="End" class="col" />
        <q-input v-model="item.step" type="number" label="step" class="col" />
        <q-input v-model="item.seat" type="number" label="Seat" class="col" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const props = defineProps({
  url: String,
  filename: String,
});
const emits = defineEmits(["list"]);
const state = reactive({
  indexs: [],
  list: computed(() => {
    if (!state.safe) {
      return [];
    }
    let list = [{ content: state.url }];
    for (let index = 0; index < state.indexs.length; index++) {
      list = generate(state.indexs[index], list);
    }
    return list.filter((v) => !!v);
  }),
  safe: computed(() => {
    const total = state.indexs.reduce((prev, current) => {
      const num = Math.floor((current.end - current.start) / current.step) + 1;
      return prev * num;
    }, 1);
    return isFinite(total) && total <= 300;
  }),
});
</script>
