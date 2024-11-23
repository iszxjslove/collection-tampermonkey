<template>
  <q-card flat>
    <q-card-section>
      <q-input v-model="state.url" type="text" label="Url" outlined />
      <q-input
        v-model="state.filename"
        type="text"
        label="Filename"
        outlined
        class="q-mt-sm"
      />
    </q-card-section>
    <q-card-section>
      <MatchUrlItem :url="state.url" :filename="state.filename" />
    </q-card-section>
    <q-card-section>
      <!-- <MatchUrlIndex :url="state.url" :filename="state.filename" /> -->
    </q-card-section>
    <q-card-section v-if="state.list.length">
      <q-item-label caption>共 {{ state.list.length }} 条记录</q-item-label>
    </q-card-section>
    <q-separator />
    <q-card-actions align="center" v-if="state.list.length">
      <q-btn
        flat
        label="预览"
        :color="state.preview ? 'primary' : 'grey-5'"
        @click="preview"
      />
      <q-btn flat label="开始采集" color="primary" @click="startCollection" />
    </q-card-actions>
    <q-card-section class="row q-col-gutter-xs" v-if="state.preview">
      <template v-for="(item, index) in state.list" :key="index">
        <div class="col-2">
          <q-img :src="item.content" :ratio="1" class="bg-grey-1" fit="contain">
            <template #loading>
              <q-spinner-ios color="primary" size="20px" />
            </template>
          </q-img>
        </div>
      </template>
    </q-card-section>
    <q-card-section v-else>
      <template v-for="(item, index) in state.template" :key="index">
        <div class="text-caption text-grey">{{ item }}</div>
      </template>
      <div v-if="state.list.length > state.template.length">......</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { padWithZero } from "src/assets/helper";
import { computed, reactive, watch } from "vue";
import MatchUrlItem from "./MatchUrlItem.vue";
import MatchUrlIndex from "./MatchUrlIndex.vue";

const state = reactive({
  preview: false,
  url: "https://tyc229.com/images_web/tyc/icon_{item}_sel.png.webp?v=1731411173350",
  filename: "",
  indexs: [],
  safe: computed(() => {
    const total = state.indexs.reduce((prev, current) => {
      const num = Math.floor((current.end - current.start) / current.step) + 1;
      return prev * num;
    }, 1);
    return isFinite(total) && total <= 300;
  }),
  template: computed(() => {
    return state.list.slice(0, 3);
  }),
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
});

function generate(item, urls) {
  const list = [];
  for (
    let index = parseFloat(item.start);
    index <= parseFloat(item.end);
    index += parseFloat(item.step)
  ) {
    list.push(
      ...urls.map((template) => {
        const pad = padWithZero(index, item.seat);
        const content = template.content.replace("{index}", pad);
        const match = content.match(/\/([^/?]+)(\?|$)/);
        let filename = match ? match[1] : "";
        if (state.filename) {
          const ext = filename.split(".").pop();
          if (state.filename.indexOf("{index}") !== -1) {
            filename = state.filename.replace("{index}", pad) + "." + ext;
          } else {
            filename = state.filename + `_${pad}.${ext}`;
          }
        }
        return { type: "image", content, filename };
      })
    );
  }
  return list;
}

watch(
  () => state.url,
  (url) => {
    state.indexs = [];
    const match = url.match(/{index}/g);
    const items = url.match(/{item}/g);
    console.log(items);

    if (!match) {
      return;
    }
    for (let i = 0; i < match.length; i++) {
      state.indexs.push({ start: 1, end: 1, step: 1, seat: 0 });
    }
  }
);

function preview() {
  state.preview = !state.preview;
}

function startCollection() {
  console.log(state.list);
}
</script>
