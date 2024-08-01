<template>
  <div :style="{ 'margin-left': `${margin}px` }">
    <template v-for="(item, key) in data">
      <div :key="key">
        <v-icon left x-small :color="margin ? 'accent' : 'secondary'"
          >mdi-checkbox-blank-circle</v-icon
        >
        <span v-html="getFormattedText(item.text)"></span>
      </div>
      <TriviaList
        :key="`children-${key}`"
        v-if="item.children"
        :data="item.children"
        :margin="margin || 25"
      />
    </template>
  </div>
</template>

<script>
import { tools } from "@/mixins/tools";

export default {
  name: "TriviaList",
  props: {
    data: { type: Array, required: true },
    margin: { type: Number, default: 0 },
  },
  mixins: [tools],
};
</script>
