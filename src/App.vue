<template>
  <v-app>
    <Header />

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-snackbar
      top
      :value="snackbar"
      :timeout="snackbar && snackbar.timeout"
      :color="snackbar && snackbar.color"
    >
      {{ snackbar && snackbar.msg }}

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="setSnackbar(null)">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <v-btn
      v-show="showGoTop"
      v-scroll="onScroll"
      fab
      small
      fixed
      bottom
      right
      color="primary"
      @click="$vuetify.goTo(0)"
    >
      <v-icon>mdi-chevron-up</v-icon>
    </v-btn>
  </v-app>
</template>

<script>
import Header from '@/components/Header';
import { mapState, mapActions } from "vuex";

export default {
  name: 'App',
  data: () => ({
    showGoTop: false,
  }),
  computed: {
    ...mapState(["snackbar"])
  },
  components: {
    Header,
  },
  methods: {
    ...mapActions(["setSnackbar"]),
    onScroll(e) {
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.showGoTop = top > 200;
    },
  },
};
</script>

<style lang="scss">
@import "./assets/styles.scss";
</style>
