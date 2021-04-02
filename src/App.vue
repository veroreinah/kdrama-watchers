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
  </v-app>
</template>

<script>
import Header from '@/components/Header';
import { mapState, mapActions } from "vuex";

export default {
  name: 'App',
  components: {
    Header,
  },
  computed: {
    ...mapState(["snackbar"])
  },
  methods: {
    ...mapActions(["setSnackbar"]),
  },
};
</script>

<style lang="scss">
@import "./assets/styles.scss";
</style>
