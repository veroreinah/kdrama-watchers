<template>
  <v-card outlined tile>
    <div class="d-flex">
      <v-img
        :src="kdrama.image || mobileBg"
        :lazy-src="mobileBg"
        height="200"
        width="140"
        max-width="140"
        gradient="to bottom, rgba(100,115,201,.1), rgba(25,32,72,.5)"
      />

      <div class="flex-grow-1 d-flex flex-column justify-space-between">
        <div>
          <v-card-title>{{ kdrama.title }}</v-card-title>
          <div v-if="kdrama.categories" class="pl-4 pr-3">
            <v-chip
              v-for="category in kdrama.categories"
              :key="category"
              color="primary"
              outlined
              small
              class="mr-1 mb-1"
            >{{ category }}</v-chip>
          </div>
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-menu offset-y left tile>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                color="primary"
                small
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item
                v-for="action in actions"
                :key="action.action"
              >
                <v-list-item-content>
                  <v-btn
                    text
                    small
                    color="secondary"
                    @click="triggerAction(action.action, kdrama)"
                  >
                    <v-icon left>{{ action.icon }}</v-icon>
                    {{ action.label }}
                  </v-btn>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-actions>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapActions, mapState } from "vuex";
import mobileBg from '@/assets/img/header-bg-mobile.jpg';

export default {
  name: 'KdramaCard',
  props: {
    kdrama: { type: Object, required: true },
  },
  data: () => ({
    mobileBg,
    actions: [
      {
        action: 'wishlist',
        icon: 'mdi-heart-plus',
        label: 'Wishlist',
      },
      {
        action: 'currently-watching',
        icon: 'mdi-eye-plus',
        label: 'Currently watching',
      },
      {
        action: 'already-watched',
        icon: 'mdi-eye-check',
        label: 'Already watched',
      },
    ],
  }),
  computed: {
    ...mapState(["user", "pendingAction"]),
  },
  watch: {
    user(value) {
      if (value && this.pendingAction) {
        this.triggerAction(this.pendingAction.action, this.pendingAction.kdrama);
        this.setPendingAction(null);
      }
    },
  },
  methods: {
    ...mapActions(["setPendingAction"]),
    triggerAction(action, kdrama) {
      if (!this.user) {
        this.setPendingAction({ action, kdrama });
        this.$router.push({ name: 'Home', query: { doLogin: true } });
      } else {
        console.log('triggerAction', action, kdrama);
      }
    },
  },
}
</script>
