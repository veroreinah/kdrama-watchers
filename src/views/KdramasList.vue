<template>
  <div class="pt-5">
    <div class="mb-5">
      <v-chip
        v-for="r in routes" 
        :key="r.route" 
        :to="r.route"
        :color="r.route.includes(list) ? 'accent' : 'primary'"
        class="mr-2"
      >
        <v-avatar left>
          <v-icon>{{ r.icon }}</v-icon>
        </v-avatar>
        {{ r.label }}
      </v-chip>
    </div>
    <div>
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <div class="row" v-else-if="kdramas && kdramas.length">
        <div
          class="col-12 col-sm-6 col-lg-4"
          v-for="drama in kdramas" :key="drama.id"
        >
          <KdramaCard :kdrama="drama" />
        </div>
      </div>

      <div v-else-if="kdramas && !kdramas.length">
        <v-card color="primary" dark>
          <v-card-title class="headline">
            <span>You haven't added any kdrama to your <strong>"{{ getListName() }}"</strong> list.</span>
          </v-card-title>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import KdramaCard from '@/components/KdramaCard';
import firebase from "firebase/app";
import "firebase/firestore";

export default {
  name: 'KdramasList',
  props: [
    'list',
  ],
  data: () => ({
    loading: false,
    kdramasRef: undefined,
    routes: [
      {
        route: '/wishlist',
        icon: 'mdi-heart-plus',
        label: 'Wishlist',
      },
      {
        route: '/currently-watching',
        icon: 'mdi-eye-plus',
        label: 'Currently watching',
      },
      {
        route: '/already-watched',
        icon: 'mdi-eye-check',
        label: 'Already watched',
      },
      {
        route: '/abandoned',
        icon: 'mdi-heart-off',
        label: 'Abandoned',
      },
    ],
    kdramas: [],
  }),
  watch: {
    list() {
      this.getData();
    },
  },
  components: {
    KdramaCard,
  },
  created() {
    const db = firebase.firestore();
    this.kdramasRef = db.collection('kdramas');
    this.getData();
  },
  methods: {
    ...mapActions(["setSnackbar"]),
    getListName() {
      const list = this.routes.find(r => r.route.includes(this.list));
      if (list) {
        return list.label;
      }
    },
    getData() {
      this.loading = true;
      
      this.kdramasRef.where("list", "==", this.list).get()
        .then(querySnapshot => {
          this.kdramas = [];
          querySnapshot.forEach(doc => this.kdramas.push({ id: doc.id, ...doc.data() }));
        })
        .catch(error => {
          console.error(error);
          this.setSnackbar({
            msg: "There was an error while getting the kdramas list.",
            color: "error",
            timeout: 10000
          });
        })
        .finally(() => this.loading = false);
    },
  },
}
</script>
