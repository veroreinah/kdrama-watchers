<template>
  <v-app>
    <Header />

    <v-main>
      <v-container style="height: 8000px;">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Header from '@/components/Header';

export default {
  name: 'App',
  components: {
    Header,
  },
  data: () => ({
    //
  }),
};
</script>

<style lang="scss">
@import "./assets/styles.scss";
</style>
