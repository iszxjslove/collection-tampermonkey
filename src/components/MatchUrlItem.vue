<template>
  <div>
    {{ state.items }}
    {{ state.list }}
    <q-input v-model="state.template" type="textarea" label="Label" outlined />
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  url: String,
  filename: String,
});
const emits = defineEmits(["list"]);

const state = reactive({
  template: "",
  list: computed(() => {
    if (!state.safe) {
      return [];
    }
    let list = [{ content: props.url }];
    for (let index = 0; index < state.items.length; index++) {
      list = generate(state.items[index], list);
    }
    return list.filter((v) => !!v);
  }),
  safe: computed(() => {
    const total = state.items.reduce((prev, current) => {
      return prev * current.length;
    }, 1);
    return isFinite(total) && total <= 300;
  }),
  items: computed(() => {
    return state.template
      .split("\n")
      .map((line) => {
        return line.split(" ").filter((v) => !!v.length);
      })
      .filter((v) => !!v.length);
  }),
});

watch(
  () => state.list,
  (list) => {
    emits("list", list);
  }
);

function generate(item, urls) {
  const list = [];
  for (let index = 0; index < item.length; index++) {
    list.push(
      ...urls.map((template, i) => {
        const content = template.content.replace("{item}", item[index]);
        if (!template.filename) {
          if (props.filename) {
            template.filename = props.filename;
          } else {
            const match = template.content.match(/\/([^/?]+)(\?|$)/);
            template.filename = match ? match[1] : "";
          }
        }
        const filename = template.filename.replace("{item}", item[index]);
        return { type: "image", content, filename };
      })
    );
  }
  return list;
}
</script>
