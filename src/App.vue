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

    <v-dialog v-model="dialog" fullscreen hide-overlay :transition="false">
      <template v-if="image">
        <v-overlay>
          <v-img
            contain
            class="largeImage"
            :src="image"
            @click="dialog = false"
          />
        </v-overlay>
      </template>
    </v-dialog>
  </v-app>
</template>

<script>
import Header from "@/components/Header";
import { mapState, mapActions } from "vuex";

export default {
  name: "App",
  data: () => ({
    showGoTop: false,
    dialog: false,
  }),
  computed: {
    ...mapState(["snackbar", "image"]),
  },
  watch: {
    image(value) {
      if (value) {
        this.dialog = true;
      }
    },
    dialog(value) {
      if (!value) {
        this.setImage(null);
      }
    },
  },
  components: {
    Header,
  },
  methods: {
    ...mapActions(["setSnackbar", "setImage"]),
    onScroll(e) {
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.showGoTop = top > 200;
    },
  },
};
</script>

<style lang="scss">
@import "./assets/styles.scss";

.largeImage {
  width: 100vw;
  height: 100vh;

  .v-image__image {
    top: 2%;
    left: 2%;
    width: 96%;
    height: 96%;
  }
}
</style>
