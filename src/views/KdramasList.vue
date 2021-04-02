<template>
  <div class="pt-2">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <v-expansion-panels tile v-else-if="kdramas && kdramas.length">
      <v-expansion-panel
        v-for="drama in kdramas" :key="drama.id"
      >
        <KdramaPanel :kdrama="drama" @updateList="getData()" />
      </v-expansion-panel>
    </v-expansion-panels>

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
  }),
  computed: {
    ...mapState(["user"]),
  },
  watch: {
    list() {
      this.getData();
    },
  },
  components: {
    KdramaPanel,
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
  },
  created() {
    const db = firebase.firestore();
    this.kdramasRef = db.collection('kdramas');
    this.getData();
  },
}
</script>
