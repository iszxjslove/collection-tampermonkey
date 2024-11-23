<template>
  <q-card flat>
    <q-card-section>
      <q-input v-model="state.url" type="text" label="Url" />
      <q-input
        v-model="state.filename"
        type="text"
        label="Filename"
        class="q-mt-sm"
      />
    </q-card-section>
    <q-card-section>
      <template v-for="(item, index) in state.items" :key="index">
        <div class="row">
          <q-input
            v-model="item.template"
            type="text"
            label="template"
            class="col"
          />
        </div>
      </template>
    </q-card-section>
    <q-card-section>
      <template v-for="(item, index) in state.indexs" :key="index">
        <div class="row">
          <q-input v-model="item.start" type="text" label="Start" class="col" />
          <q-input v-model="item.end" type="text" label="End" class="col" />
          <q-input v-model="item.step" type="number" label="step" class="col" />
          <q-input v-model="item.seat" type="number" label="Seat" class="col" />
        </div>
      </template>
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
      <q-btn flat label="开始采集" color="primary" @click="actions.save" />
    </q-card-actions>
    <q-card-section class="row q-col-gutter-xs" v-if="state.preview">
      <template v-for="(item, index) in state.list" :key="index">
        <div class="col-2">
          <q-img :src="item.url" :ratio="1" class="bg-grey-1" fit="contain">
            <template #loading>
              <q-spinner-ios color="primary" size="20px" />
            </template>
          </q-img>
        </div>
      </template>
    </q-card-section>
    <q-card-section v-else>
      <template v-for="(item, index) in state.template" :key="index">
        <div class="text-caption text-grey">{{ item.url }}</div>
      </template>
      <div v-if="state.list.length > state.template.length">......</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { commonPost, padWithZero, useHotKey } from "src/assets/helper";
import { computed, onUnmounted, reactive, watch } from "vue";
const state = reactive({
  preview: false,
  url: "",
  filename: "",
  filenameTemplate: computed(() => {
    const match = state.url.match(/\/([^/?]+)(\?|$)/);
    if (!match || !match[1]) {
      return "";
    }
    let name = match[1].substr(0, match[1].lastIndexOf("."));
    const ext = match[1].split(".").pop();
    if (state.filename) {
      name = state.filename;
    }
    const urlTemplate = state.url.match(/({index})|({item})/g) || [];
    const nameTemplate = name.match(/({index})|({item})/g) || [];
    const result = urlTemplate
      .map((item) => {
        const index = nameTemplate.indexOf(item);
        if (index !== -1) {
          nameTemplate.splice(index, 1);
          return null;
        }
        return item;
      })
      .filter((item) => item !== null);
    return name + result.join("-") + `.${ext}`;
  }),
  indexs: [],
  items: [],
  safe: computed(() => {
    const totalIndexs = state.indexs.reduce((prev, current) => {
      const num = Math.floor((current.end - current.start) / current.step) + 1;
      return prev * num;
    }, 1);
    const totalItems = state.items.reduce((prev, current) => {
      const arr = current.template.split(" ").filter((v) => !!v.length);
      return prev * arr.length;
    }, 1);
    const total = totalIndexs * totalItems;
    return isFinite(total) && total <= 300;
  }),
  template: computed(() => {
    return state.list.slice(0, 3);
  }),
  list: computed(() => {
    if (!state.safe) {
      return [];
    }
    let list = [{ url: state.url }];
    for (let index = 0; index < state.indexs.length; index++) {
      list = generateIndexs(state.indexs[index], list);
    }
    for (let index = 0; index < state.items.length; index++) {
      list = generateItems(state.items[index], list);
    }
    return list
      .filter((v) => !!v && v.url)
      .map((v) => {
        if (!v.filename) {
          const match = v.url.match(/\/([^/?]+)(\?|$)/);
          v.filename = match[1];
        }
        return v;
      });
  }),
});

function generateItems(item, urls) {
  const tmp = item.template.replace(/[\s,，、|]+/g, " ");
  const tabs = tmp.split(" ").filter((v) => !!v.length);
  if (!tabs.length) {
    return urls;
  }
  const list = [];
  for (let index = 0; index < tabs.length; index++) {
    list.push(
      ...urls.map((template, i) => {
        const url = template.url.replace("{item}", tabs[index]);
        if (!template.filename) {
          template.filename = state.filenameTemplate;
        }
        const filename = template.filename.replace("{item}", tabs[index]);
        return { type: "image", url, filename };
      })
    );
  }
  return list;
}

function generateIndexs(item, urls) {
  const list = [];
  for (
    let index = parseFloat(item.start);
    index <= parseFloat(item.end);
    index += parseFloat(item.step)
  ) {
    list.push(
      ...urls.map((template) => {
        const pad = padWithZero(index, item.seat);
        const url = template.url.replace("{index}", pad);
        if (!template.filename) {
          template.filename = state.filenameTemplate;
        }
        const filename = template.filename.replace("{index}", pad);
        return { type: "image", url, filename };
      })
    );
  }
  return list;
}

function parseIndexs(url) {
  const match = url.match(/\{item\}/g);
  if (!match) {
    return [];
  }
  return match.map(() => ({ start: 1, end: 1, step: 1, seat: 0 }));
}
function parseItems(url) {
  const match = url.match(/\{item\}/g);
  if (!match) {
    return [];
  }
  return match.map(() => ({ template: "" }));
}

watch(
  () => state.url,
  (url) => {
    state.items = parseItems(url);
    state.indexs = parseIndexs(url);
  }
);
function preview() {
  state.preview = !state.preview;
}

const actions = {
  save: () => commonPost("save", state.list),
};

const options = {
  sync: true,
  combination: {
    ctrlKey: { save: ["s"] },
  },
  callbacks: actions,
};

const hotKey = useHotKey(options);
onUnmounted(() => {
  hotKey.destroy();
});
</script>
