<template>
  <div class="pt-2">
    <v-text-field
      v-model="query"
      label="Buscar un kdrama..."
      outlined
      clearable
      autofocus
      autocomplete="off"
      append-icon="mdi-magnify"
      @keypress.enter="search"
      @click:append="search"
    ></v-text-field>

    <div>
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <div class="row" v-else-if="data && data.length">
        <div
          class="col-12 col-sm-6 col-lg-4"
          v-for="result in data" :key="result.id"
        >
          <KdramaCard :kdrama="result" :savedKdramas="addedKdramas" @updateList="loadKdramas" />
        </div>
      </div>

      <div v-else-if="data && !data.length">
        <v-card color="primary" dark>
          <v-card-title class="headline">
            <span>No hemos podido encontrar ningún resultado que coincida con <strong>"{{ query }}"</strong>.</span>
          </v-card-title>
          <v-card-subtitle>Intenta otra búsqueda!</v-card-subtitle>
        </v-card>
      </div>
    </div>

    <Login v-if="!user" />
  </div>
</template>

<script>
import KdramaCard from '@/components/KdramaCard';
import Login from '@/components/Login';
import { mapState } from "vuex";
import { kdramas } from "@/mixins/kdramas";

export default {
  name: 'Home',
  data: () => ({
    query: '',
    loading: false,
    data: null,
    addedKdramas: [],
  }),
  computed: {
    ...mapState(["user"]),
  },
  watch: {
    query() {
      this.data = null;
    },
    user(value) {
      if (value && value.uid) {
        this.loadKdramas();
      }
    },
  },
  components: {
    KdramaCard,
    Login,
  },
  mixins: [
    kdramas,
  ],
  methods: {
    search() {
      if (this.query) {
        this.loading = true;

        this.searchKdrama(this.query)
          .then(results => this.data = results)
          .finally(() => this.loading = false);
      }
    },
    loadKdramas() {
      this.getKdramas(this.user)
        .then(kdramas => this.addedKdramas = kdramas);
    }
  },
  created() {
    if (this.user && this.user.uid) {
      this.loadKdramas();
    }
  },
}
</script>
