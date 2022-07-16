<template>
  <div class="pt-2">
    <KdramasFilter :kdramas="kdramas" @filterChange="filterChange">
      <SearchBox />
    </KdramasFilter>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <template v-else-if="kdramas && kdramas.length">
      <v-btn
        v-if="list === 'wishlist'"
        depressed
        tile
        small
        fixed
        bottom
        left
        color="secondary"
        @click="pickOneRandomly"
        :style="{ 'z-index': 2 }"
      >
        ✨ ¿Cuál veo ahora?
      </v-btn>

      <div>
        <v-expansion-panels tile multiple class="pb-15">
          <v-expansion-panel v-for="drama in filteredKdramas" :key="drama.id">
            <KdramaPanel :kdrama="drama" @updateList="getData()" />
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <KdramaDialog
        :open="open"
        :kdrama="randomKdrama"
        @close="closeDialog"
        @updateList="getData()"
      />
    </template>

    <div v-else-if="kdramas && !kdramas.length">
      <v-card color="primary" dark>
        <v-card-title class="headline">
          <span
            >No has añadido ningún kdrama a la lista
            <strong>"{{ getListProp(list, "label") }}"</strong>.</span
          >
        </v-card-title>
      </v-card>
    </div>
  </div>
</template>

<script>
import SearchBox from "@/components/SearchBox";
import KdramaPanel from "@/components/KdramaPanel";
import KdramaDialog from "@/components/KdramaDialog";
import KdramasFilter from "@/components/KdramasFilter";
import { mapState } from "vuex";
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: "KdramasList",
  props: ["list"],
  data: () => ({
    loading: false,
    kdramas: [],
    randomKdrama: undefined,
    open: false,
    filterGenre: [],
    filterCategories: [],
  }),
  computed: {
    ...mapState(["user"]),
    filteredKdramas() {
      let kdramas = this.kdramas.filter((kdrama) => {
        const noFilters =
          !this.filterGenre.length && !this.filterCategories.length;
        let resultGenre = [];
        let resultCategories = [];

        if (kdrama.genre) {
          const genreLower = this.filterGenre.map((g) => g.toLowerCase());
          resultGenre = kdrama.genre.filter(
            (genre) => noFilters || genreLower.includes(genre.toLowerCase())
          );
        }
        if (kdrama.categories) {
          const categoriesLower = this.filterCategories.map((c) =>
            c.toLowerCase()
          );
          resultCategories = kdrama.categories.filter(
            (category) =>
              noFilters || categoriesLower.includes(category.toLowerCase())
          );
        }

        return resultGenre.length || resultCategories.length;
      });

      const sortField = this.getListProp(this.list, "sortField");

      kdramas = kdramas.sort((a, b) => {
        if (a[sortField] && b[sortField]) {
          return new Date(b[sortField]) - new Date(a[sortField]);
        } else {
          const dateA = a.watchDates[a.watchDates.length - 1][sortField];
          const dateB = b.watchDates[b.watchDates.length - 1][sortField];
          return new Date(dateB) - new Date(dateA);
        }
      });

      return kdramas;
    },
  },
  watch: {
    list() {
      this.getData();
    },
  },
  components: {
    SearchBox,
    KdramaPanel,
    KdramasFilter,
    KdramaDialog,
  },
  mixins: [kdramas, tools],
  methods: {
    getData() {
      this.loading = true;
      this.filterGenre = [];
      this.filterCategories = [];

      this.getKdramas(this.user, ["==", this.list])
        .then((kdramas) => (this.kdramas = kdramas))
        .finally(() => (this.loading = false));
    },
    filterChange(filters) {
      this.filterGenre = filters.genre;
      this.filterCategories = filters.categories;
    },
    pickOneRandomly() {
      this.randomKdrama =
        this.filteredKdramas[
          Math.floor(Math.random() * this.filteredKdramas.length)
        ];
      this.open = true;
    },
    closeDialog() {
      this.randomKdrama = undefined;
      this.open = false;
    },
  },
  created() {
    this.getData();
  },
};
</script>
