<template>
  <v-app-bar
    fixed
    color="primary"
    dark
    :src="$vuetify.breakpoint.xs ? mobileBg : desktopBg"
    height="64"
  >
    <template v-slot:img="{ props }">
      <v-img
        v-bind="props"
        gradient="to top right, rgba(100,115,201,.7), rgba(25,32,72,.7)"
      ></v-img>
    </template>

    <v-toolbar-title>Kdrama watchers</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn icon :to="{ name: 'Home' }" exact>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-btn icon to="/lists">
      <v-icon>mdi-heart</v-icon>
    </v-btn>

    <v-btn v-if="user" icon @click="logout">
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>

    <template v-slot:extension>
      <v-tabs show-arrows>
        <v-tab
          v-for="r in routes" 
          :key="r.route" 
          :to="r.route"
        >
          <v-icon left>{{ r.icon }}</v-icon>
          {{ r.label }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import mobileBg from '@/assets/img/header-bg-mobile.jpg';
import desktopBg from '@/assets/img/header-bg-desktop.jpg';

export default {
  name: "Header",
  data: () => ({
    mobileBg,
    desktopBg,
    routes: [
      {
        route: '/lists/wishlist',
        icon: 'mdi-heart-plus',
        label: 'Lista de deseos',
      },
      {
        route: '/lists/currently-watching',
        icon: 'mdi-eye-plus',
        label: 'Viendo',
      },
      {
        route: '/lists/already-watched',
        icon: 'mdi-eye-check',
        label: 'Vistos',
      },
      {
        route: '/lists/abandoned',
        icon: 'mdi-heart-off',
        label: 'Abandonados',
      },
    ],
  }),
  computed: {
    ...mapState(["user"]),
  },
  methods: {
    ...mapActions(["logout"]),
  },
};
</script>
