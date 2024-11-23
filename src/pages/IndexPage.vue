<template>
  <q-page>
    <q-tabs v-model="state.index" active-color="primary">
      <q-tab :name="0" label="采集图片" />
      <q-tab :name="1" label="匹配图片" />
    </q-tabs>
    <MatchContentGroup v-if="state.index === 0" />
    <MatchImageUrl v-if="state.index === 1" />
  </q-page>
</template>

<script setup>
import { postMessage } from "src/assets/helper";
import MatchContentGroup from "src/components/MatchContentGroup.vue";
import MatchImageUrl from "src/components/MatchImageUrl.vue";
import { onMounted, reactive } from "vue";

defineOptions({
  name: "IndexPage",
});

const state = reactive({
  index: 0,
});

onMounted(() => {
  postMessage("init");
});
</script>
