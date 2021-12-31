<template>
  <div class="pt-2">
    <SearchBox :initial="q" />

    <div>
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <div class="row" v-else-if="data && data.length">
        <div
          class="col-12 col-sm-6 col-lg-4"
          v-for="result in data"
          :key="result.id"
        >
          <KdramaCard
            :kdrama="result"
            :savedKdramas="addedKdramas"
            @updateList="loadKdramas"
          />
        </div>
      </div>

      <div v-else-if="data && !data.length">
        <v-card color="primary" dark>
          <v-card-title class="headline">
            <span
              >No hemos podido encontrar ningún resultado que coincida con
              <strong>"{{ q }}"</strong>.</span
            >
          </v-card-title>
          <v-card-subtitle>Intenta otra búsqueda!</v-card-subtitle>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import SearchBox from "@/components/SearchBox";
import KdramaCard from "@/components/KdramaCard";
import { mapState } from "vuex";
import { kdramas } from "@/mixins/kdramas";

export default {
  name: "Search",
  props: ["q"],
  data: () => ({
    loading: false,
    data: null,
    addedKdramas: [],
  }),
  computed: {
    ...mapState(["user"]),
  },
  watch: {
    q() {
      this.data = null;
      this.search();
    },
    user(value) {
      if (value && value.uid) {
        this.loadKdramas();
      }
    },
  },
  components: {
    SearchBox,
    KdramaCard,
  },
  mixins: [kdramas],
  methods: {
    search() {
      if (this.q) {
        this.loading = true;

        this.searchKdrama(this.q)
          .then((results) => (this.data = results))
          .finally(() => (this.loading = false));
      }
    },
    loadKdramas() {
      this.getKdramas(this.user).then(
        (kdramas) => (this.addedKdramas = kdramas)
      );
    },
  },
  created() {
    this.loadKdramas();
    this.search();
  },
};
</script>
