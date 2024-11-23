<template>
  <div class="row">
    <div class="col-md-auto col-12" style="max-width: 400px; width: 100%">
      <div class="q-pa-md row items-center">
        <div class="col q-gutter-x-md">
          <q-btn
            color="primary"
            icon="add"
            dense
            @click="actions.push"
            unelevated
          >
            <q-tooltip class="bg-primary">添加采集</q-tooltip>
          </q-btn>
          <q-btn
            color="warning"
            icon="upload"
            dense
            @click="actions.up"
            unelevated
            :disable="elements.ancestors.disable.up"
          >
            <q-tooltip class="bg-warning">向外一层查找</q-tooltip>
          </q-btn>
          <q-btn
            color="warning"
            icon="download"
            dense
            @click="actions.down"
            unelevated
            :disable="elements.ancestors.disable.down"
          >
            <q-tooltip class="bg-warning">向内一层查找</q-tooltip>
          </q-btn>
          <q-btn
            color="positive"
            icon="check"
            dense
            unelevated
            @click="actions.save"
          >
            <q-tooltip class="bg-positive">保存</q-tooltip>
          </q-btn>
        </div>
        <div class="col-auto text-grey">
          共匹配到
          <span class="text-orange">
            {{ elements.contents.length }}
          </span>
          组内容
        </div>
      </div>
      <q-separator />
      <template v-for="(el, index) in elements.options" :key="index">
        <q-separator v-if="index > 0" />
        <q-card flat>
          <q-card-section
            class="row items-center"
            :class="{ 'bg-grey-1': elements.index === index }"
          >
            <div class="col flex items-center">
              <q-btn
                :color="elements.index === index ? 'primary' : 'grey'"
                icon="highlight_alt"
                dense
                flat
                @click="actions.toggle(index)"
                class="on-left"
              />
              <q-option-group
                :options="typeOptions"
                type="radio"
                v-model="el.type"
                @update:model-value="(v) => actions.switch(index, v)"
                inline
                dense
              />
            </div>
            <div class="col-auto">
              <q-btn
                color="red"
                icon="close"
                flat
                dense
                @click="actions.delete(index)"
              />
            </div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div v-if="el.type === 'text'">
              <q-input v-model="el.value" outlined />
            </div>
            <div v-else-if="el.type === 'image' || el.type === 'background'">
              <q-input
                v-model="el.filename"
                outlined
                type="text"
                placeholder="重命名，{index}占位符可选，默认自动追加"
              >
                <template #before>
                  <q-img
                    :src="el.value"
                    spinner-size="28px"
                    fit="contain"
                    class="bg-grey-3"
                    style="width: 100px; height: 56px; border-radius: 4px"
                  />
                </template>
              </q-input>
            </div>
          </q-card-section>
        </q-card>
      </template>
    </div>
    <q-card
      v-if="elements.contents"
      class="collection-content col-md col-12"
      flat
    >
      <q-separator />
      <template v-for="(item, index) in elements.contentsComputed" :key="index">
        <q-separator v-if="index > 0" inset />
        <q-card-section class="q-pa-none">
          <template v-for="(node, ni) in elements.options" :key="ni">
            <div class="collection-item" v-if="item[ni]">
              <q-item v-if="node.type === 'text'" clickable dense>
                <q-item-section>
                  <q-item-label> {{ item[ni].content }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-else clickable>
                <q-item-section top avatar>
                  <img :src="item[ni].content" style="height: 40px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis">
                    {{ item[ni].filename }}
                  </q-item-label>
                  <q-item-label caption> 4833kb </q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-icon name="check" color="green" />
                </q-item-section>
              </q-item>
            </div>
          </template>
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import {
  generateFilename,
  padWithZero,
  actionPost,
  useHotKey,
  commonPost,
  useMessage,
} from "src/assets/helper";
import { reactive, toRaw, computed, onUnmounted } from "vue";

const defaultElementOption = {
  type: "text",
  value: "",
  filename: "",
};
const typeOptions = [
  { label: "文字", value: "text" },
  { label: "图片", value: "image" },
  { label: "背景", value: "background" },
];
const elements = reactive({
  index: -1,
  options: [],
  contents: [],
  contentsComputed: computed(() => {
    return elements.contents.map((item) => {
      return item.map((content, index) => {
        if (content.type === "image" || content.type === "background") {
          content.filename = filename(content.content, index);
        }
        return content;
      });
    });
  }),
  ancestors: {
    index: 0,
    length: 0,
    disable: {
      up: computed(() => {
        return elements.ancestors.index >= elements.ancestors.length - 1;
      }),
      down: computed(() => {
        return elements.ancestors.index === 0;
      }),
    },
  },
});

function filename(src, index) {
  const opt = elements.options[index];
  const len = elements.contents.length.toString().length;
  const pad = padWithZero(index, len);
  return generateFilename(src, pad, opt.filename);
}

const events = {
  onPreview() {
    if (elements.index == -1) {
      return;
    }
    elements.options[elements.index].value = this.data.params.value;
  },
  onSelection() {
    elements.contents = this.data.params.contents;
  },
  onSelected() {
    elements.index = -1;
  },
  onClosestIndex() {
    const { length, index } = this.data.params;
    elements.ancestors.length = length;
    elements.ancestors.index = index;
  },
  onForwarding() {
    const { action, key } = this.data.params;
    keydown.action.call(null, action, key);
  },
  onSaveProgress() {
    console.log(this.data.params);
  },
};

window.addEventListener("message", (e) => {
  if (!e.data?.action || typeof events[e.data.action] !== "function") {
    return;
  }
  events[e.data.action].call(e);
});
const actions = {
  push() {
    const option = JSON.parse(JSON.stringify(defaultElementOption));
    elements.options.push(option);
    actionPost("push", { option });
  },
  toggle(index) {
    const option = elements.options[index];
    if (!option) {
      return;
    }
    elements.index = index;
    actionPost("toggle", { index, option: toRaw(option) });
  },
  switch(index, type) {
    const option = elements.options[index];
    if (!option) {
      return;
    }
    option.type = type;
    actions.toggle(index);
  },
  up() {
    actionPost("up");
  },
  down() {
    actionPost("down");
  },
  save() {
    commonPost("save", JSON.parse(JSON.stringify(elements.contentsComputed)));
  },
  delete(index) {
    if (index === elements.index) {
      elements.index = -1;
    }
    elements.options.splice(index, 1);
    actionPost("delete", { index });
  },
  select() {
    actionPost("select");
  },
};
const keys = {
  up: ["pageup", "arrowup"],
  down: ["pagedown", "arrowdown"],
  save: ["s"],
  push: ["+"],
  switch: ["t", "g", "b"],
  delete: ["delete"],
  select: ["enter"],
  toggle: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  escape: ["escape"],
};
const attrs = { t: "text", g: "image", b: "background" };
const keydown = {
  sync: true,
  combination: {
    ctrlKey: keys,
    metaKey: keys,
    shiftKey: { up: keys.up, down: keys.down },
    "": { escape: keys.escape },
  },
  callbacks: actions,
  parser: {
    toggle(index) {
      return [parseInt(index)];
    },
    switch(key) {
      const type = attrs[key];
      if (!type) {
        return;
      }
      if (!elements.options.length) {
        actions.push();
      }
      let index = elements.index;
      if (index === -1) {
        index = elements.options.length - 1;
      }
      if (elements.index !== index) {
        actions.toggle(index);
      }
      return [index, type];
    },
    delete() {
      let index = elements.index;
      if (index === -1) {
        index = elements.options.length - 1;
      }
      if (index < 0) {
        return;
      }
      return [index];
    },
  },
};

const hotKey = useHotKey(keydown);
const message = useMessage({ callbacks: events });
onUnmounted(() => {
  hotKey.destroy();
  message.destroy();
});
</script>
<style lang="scss" scoped>
.collection-content {
  .collection-image img {
    max-height: 60px;
  }
}
</style>
