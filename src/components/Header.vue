<template>
  <v-app-bar
    fixed
    color="primary"
    dark
    shrink-on-scroll
    :src="$vuetify.breakpoint.xs ? mobileBg : desktopBg"
    height="128"
    min-height="56"
  >
    <template v-slot:img="{ props }">
      <v-img
        v-bind="props"
        gradient="to top right, rgba(100,115,201,.7), rgba(25,32,72,.7)"
      ></v-img>
    </template>

    <v-app-bar-title>
      <div>K-drama watchers</div>
      <div class="text-subtitle-1 font-weight-thin">We watch kdramas</div>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn icon :to="{ name: 'Home' }">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-menu offset-y left tile>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="userRoute in userRoutes"
          :key="userRoute.route"
        >
          <v-list-item-content>
            <v-btn
              text
              small
              color="secondary"
              :to="userRoute.route"
            >
              <v-icon left>{{ userRoute.icon }}</v-icon>
              {{ userRoute.label }}
            </v-btn>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import mobileBg from '@/assets/img/header-bg-mobile.jpg';
import desktopBg from '@/assets/img/header-bg-desktop.jpg';

export default {
  name: "Header",
  data: () => ({
    mobileBg,
    desktopBg,
    userRoutes: [
      {
        route: '/wishlist',
        icon: 'mdi-heart-plus',
        label: 'Wishlist',
      },
      {
        route: '/currenty-watching',
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
    ]
  }),
};
</script>
