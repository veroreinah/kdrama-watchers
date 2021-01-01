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

    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-heart</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
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
  }),
};
</script>
