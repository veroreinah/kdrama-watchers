<template>
  <v-text-field
    v-model="query"
    label="Buscar un kdrama..."
    outlined
    clearable
    autofocus
    autocomplete="off"
    append-icon="mdi-magnify"
    hide-details="auto"
    :class="searchPage ? 'mb-2' : ''"
    @keypress.enter="search"
    @click:append="search"
  ></v-text-field>
</template>

<script>
export default {
  name: "SearchBox",
  props: {
    initial: { type: String, required: false },
    searchPage: { type: Boolean, default: false },
  },
  data: () => ({
    query: "",
  }),
  watch: {
    initial(value) {
      if (value) {
        this.query = value;
      }
    },
  },
  methods: {
    search() {
      if (this.query) {
        this.$router.push({ name: "Search", query: { q: this.query } });
      }
    },
  },
  created() {
    if (this.initial) {
      this.query = this.initial;
    }
  },
};
</script>
