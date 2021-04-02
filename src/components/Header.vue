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

    <v-btn icon to="/calendar" exact>
      <v-icon>mdi-calendar-heart</v-icon>
    </v-btn>

    <v-btn v-if="user" icon @click="logout">
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>

    <template v-slot:extension v-if="$route.path.includes('lists')">
      <v-tabs show-arrows grow>
        <v-tab
          v-for="list in availableLists" 
          :key="list.route" 
          :to="list.route"
        >
          <v-icon left>{{ list.icon }}</v-icon>
          {{ list.label }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { tools } from "@/mixins/tools";

export default {
  name: "Header",
  computed: {
    ...mapState(["user"]),
  },
  mixins: [
    tools,
  ],
  methods: {
    ...mapActions(["logout"]),
  },
};
</script>
