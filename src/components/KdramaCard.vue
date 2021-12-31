<template>
  <v-card outlined tile>
    <div class="d-flex">
      <v-img
        :src="kdrama.image || mobileBg"
        :lazy-src="mobileBg"
        :height="small ? 100 : 200"
        :width="small ? 70 : 140"
        :max-width="small ? 70 : 140"
        gradient="to bottom, rgba(100,115,201,.1), rgba(25,32,72,.5)"
      />

      <div class="flex-grow-1 d-flex flex-column justify-space-between">
        <div>
          <v-card-title
            class="d-flex flex-column flex-sm-row align-start align-sm-center"
          >
            <h2 class="kdrama-title">{{ kdrama.title }}</h2>
            <slot name="afterTitle"></slot>
          </v-card-title>
          <div v-if="kdrama.genre || kdrama.categories" class="pl-4 pr-3">
            <v-chip
              v-for="category in kdrama.genre || kdrama.categories"
              :key="category"
              color="primary"
              outlined
              small
              class="mr-1 mb-1"
              >{{ category }}</v-chip
            >
          </div>
        </div>

        <v-card-actions v-if="!hideActions && hasActions()">
          <v-spacer></v-spacer>

          <v-menu offset-y left tile>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                color="primary"
                small
                v-bind="attrs"
                v-on="on"
                :loading="loading"
                :disabled="loading"
              >
                <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
            </template>
            <v-list v-if="toUpdate()" dense>
              <v-list-item>
                <v-list-item-content>
                  <v-btn text small color="secondary" @click="update()">
                    <v-icon left>mdi-content-save</v-icon>
                    Actualizar
                  </v-btn>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-list v-else dense>
              <v-list-item v-for="list in availableLists" :key="list.action">
                <v-list-item-content>
                  <v-btn
                    text
                    small
                    color="secondary"
                    @click="triggerAction(list.action, kdrama)"
                  >
                    <v-icon left>{{ list.icon }}</v-icon>
                    {{ list.label }}
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
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: "KdramaCard",
  props: {
    kdrama: { type: Object, required: true },
    small: { type: Boolean, default: false },
    hideActions: { type: Boolean, default: false },
    savedKdramas: { type: Array },
  },
  data: () => ({
    loading: false,
  }),
  computed: {
    ...mapState(["user", "pendingAction"]),
    idsToUpdate() {
      return this.savedKdramas
        ? this.savedKdramas.map((element) => element.wikiaId)
        : [];
    },
  },
  watch: {
    user(value) {
      if (value && this.pendingAction) {
        this.triggerAction(
          this.pendingAction.action,
          this.pendingAction.kdrama
        );
        this.setPendingAction(null);
      }
    },
  },
  mixins: [kdramas, tools],
  methods: {
    ...mapActions(["setPendingAction"]),
    hasActions() {
      return (
        this.kdrama.categories &&
        this.kdrama.categories.some(
          (category) => category.toLowerCase() === "kdrama"
        )
      );
    },
    toUpdate() {
      return (
        this.idsToUpdate &&
        this.idsToUpdate.length &&
        this.idsToUpdate.includes(this.kdrama.id)
      );
    },
    async update() {
      this.loading = true;

      const savedData = this.savedKdramas.find(
        (kdrama) => kdrama.wikiaId === this.kdrama.id
      );
      const extraInfo = await this.getKramaInfo(
        this.kdrama.id,
        this.kdrama.title
      );

      const toUpdate = {
        ...savedData,
        ...this.kdrama,
        ...extraInfo,
        id: savedData.id,
        dateUpdated: new Date().toJSON(),
      };

      this.updateKdrama(toUpdate)
        .then(() => {
          this.$emit("updateList");
        })
        .finally(() => (this.loading = false));
    },
    async triggerAction(action, kdrama) {
      this.loading = true;

      if (!this.user) {
        this.setPendingAction({ action, kdrama });
        this.$router.push({ name: "Login" });
      } else {
        const extraInfo = await this.getKramaInfo(kdrama.id, kdrama.title);
        let dateStart = null;
        let dateEnd = null;
        const now = new Date();

        if (action !== "wishlist") {
          dateStart = this.parseDate(now);
        }
        if (action === "already-watched" || action === "abandoned") {
          dateEnd = this.parseDate(now);
        }

        const toSave = {
          ...kdrama,
          ...extraInfo,
          wikiaId: kdrama.id,
          user: this.user.uid,
          list: action,
          rating: null,
          dateAdd: now.toJSON(),
          dateStart,
          dateEnd,
        };

        delete toSave.id;

        this.addKdrama(toSave)
          .then(() => {
            this.$emit("updateList");
          })
          .finally(() => (this.loading = false));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.kdrama-title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
}
</style>
