<template>
  <div class="mb-2">
    <div class="d-flex align-center">
      <slot name="default"></slot>

      <v-btn
        v-if="genre.length || categories.length"
        icon
        color="accent"
        @click="reset"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn icon color="accent" @click="toggleFilters">
        <v-icon>mdi-tune</v-icon>
      </v-btn>
    </div>

    <v-expansion-panels
      v-if="showFilters"
      v-model="panel"
      tile
      flat
      multiple
      accordion
    >
      <v-expansion-panel>
        <v-expansion-panel-header class="pa-0">Género</v-expansion-panel-header>
        <v-expansion-panel-content class="pa-0">
          <v-chip-group v-model="genre" column multiple>
            <v-chip
              filter
              color="accent"
              v-for="filter in genreFilters"
              :key="filter"
            >
              {{ filter }}
            </v-chip>
          </v-chip-group>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header class="pa-0"
          >Categorías</v-expansion-panel-header
        >
        <v-expansion-panel-content class="pa-0">
          <v-chip-group v-model="categories" column multiple>
            <v-chip
              filter
              color="secondary"
              v-for="filter in categoriesFilters"
              :key="filter"
            >
              {{ filter }}
            </v-chip>
          </v-chip-group>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
export default {
  name: "KdramasFilter",
  props: {
    kdramas: { type: Array, required: true },
  },
  data: () => ({
    showFilters: false,
    panel: [0],
    genre: [],
    categories: [],
  }),
  computed: {
    genreFilters() {
      let result = [];
      this.kdramas.forEach((kdrama) => {
        const genre = kdrama.genre ? kdrama.genre : [];
        result = [...result, ...genre];
      });
      result.sort();
      const resultLower = result.map((r) => r.toLowerCase());

      return result.filter(
        (value, index) => resultLower.indexOf(value.toLowerCase()) === index
      );
    },
    categoriesFilters() {
      let result = [];
      this.kdramas.forEach((kdrama) => {
        const categories = kdrama.categories ? kdrama.categories : [];
        result = [...result, ...categories];
      });
      result.sort();
      const resultLower = result.map((r) => r.toLowerCase());
      const genreLower = this.genreFilters.map((g) => g.toLowerCase());

      return result.filter(
        (value, index) =>
          resultLower.indexOf(value.toLowerCase()) === index &&
          !genreLower.includes(value.toLowerCase())
      );
    },
  },
  watch: {
    genre() {
      this.filterChange();
    },
    categories() {
      this.filterChange();
    },
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    reset() {
      this.genre = [];
      this.categories = [];
    },
    filterChange() {
      const data = {
        genre: this.genre.map((value) => this.genreFilters[value]),
        categories: this.categories.map(
          (value) => this.categoriesFilters[value]
        ),
      };
      this.$emit("filterChange", data);
    },
  },
};
</script>

<style lang="scss" scoped>
.v-expansion-panel-header,
.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 32px;
}

.v-expansion-panel-content {
  ::v-deep {
    .v-expansion-panel-content__wrap {
      padding: 0;
    }
  }
}
</style>
