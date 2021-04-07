<template>
  <div class="pt-2">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <template v-else-if="kdramas && kdramas.length">
      <KdramasFilter :kdramas="kdramas" @filterChange="filterChange" />

      <v-expansion-panels tile multiple>
        <v-expansion-panel
          v-for="drama in filteredKdramas" :key="drama.id"
        >
          <KdramaPanel :kdrama="drama" @updateList="getData()" />
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <div v-else-if="kdramas && !kdramas.length">
      <v-card color="primary" dark>
        <v-card-title class="headline">
          <span>No has añadido ningún kdrama a la lista <strong>"{{ getListProp(list, 'label') }}"</strong>.</span>
        </v-card-title>
      </v-card>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import KdramaPanel from '@/components/KdramaPanel';
import KdramasFilter from '@/components/KdramasFilter';
import { mapActions, mapState } from 'vuex';
import { tools } from "@/mixins/tools";

export default {
  name: 'KdramasList',
  props: [
    'list',
  ],
  data: () => ({
    loading: false,
    kdramasRef: undefined,
    kdramas: [],
    filterGenre: [],
    filterCategories: [],
  }),
  computed: {
    ...mapState(["user"]),
    filteredKdramas() {
      return this.kdramas.filter(kdrama => {
        const noFilters = !this.filterGenre.length && !this.filterCategories.length;
        let resultGenre = [];
        let resultCategories = [];

        if (kdrama.genre) {
          const genreLower = this.filterGenre.map(g => g.toLowerCase());
          resultGenre = kdrama.genre.filter(genre => noFilters || genreLower.includes(genre.toLowerCase()));
        }
        if (kdrama.categories) {
          const categoriesLower = this.filterCategories.map(c => c.toLowerCase());
          resultCategories = kdrama.categories.filter(category => noFilters || categoriesLower.includes(category.toLowerCase()));
        }

        return resultGenre.length || resultCategories.length;
      });
    },
  },
  watch: {
    list() {
      this.getData();
    },
  },
  components: {
    KdramaPanel,
    KdramasFilter,
  },
  mixins: [
    tools,
  ],
  methods: {
    ...mapActions(["setSnackbar"]),
    getData() {
      this.loading = true;
      
      this.kdramasRef
        .where("user", "==", this.user.uid)
        .where("list", "==", this.list)
        .orderBy(this.getListProp(this.list, 'sortField'), "desc")
        .get()
        .then(querySnapshot => {
          this.kdramas = [];
          querySnapshot.forEach(doc => this.kdramas.push({ id: doc.id, ...doc.data() }));
        })
        .catch(error => {
          console.error(error);
          this.setSnackbar({
            msg: "Ha habido un error al recuperar el listado de kdramas.",
            color: "error",
            timeout: 10000
          });
        })
        .finally(() => this.loading = false);
    },
    filterChange(filters) {
      this.filterGenre = filters.genre;
      this.filterCategories = filters.categories;
    },
  },
  created() {
    const db = firebase.firestore();
    this.kdramasRef = db.collection('kdramas');
    this.getData();
  },
}
</script>
