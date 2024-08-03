<template>
  <v-dialog v-model="dialog" max-width="500" @click:outside="$emit('close')">
    <v-card>
      <v-card-text v-if="kdrama" class="pa-0">
        <KdramaCard :kdrama="kdrama" hide-actions />
        <div
          v-if="kdrama.synopsis"
          v-html="getFormattedText(kdrama.synopsis)"
          class="px-4 py-2"
        ></div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn depressed tile @click="$emit('close')">
          Cancelar
        </v-btn>
        <v-btn
          depressed
          tile
          color="secondary"
          :loading="loading"
          @click="moveKdrama"
        >
          Empezar a ver
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import KdramaCard from "@/components/KdramaCard";
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: "KdramaDialog",
  props: {
    open: { type: Boolean, default: false },
    kdrama: { type: Object },
  },
  data: () => ({
    dialog: false,
    loading: false,
  }),
  watch: {
    open(value) {
      this.dialog = value;
    },
  },
  components: {
    KdramaCard,
  },
  mixins: [kdramas, tools],
  methods: {
    moveKdrama() {
      this.loading = true;
      const list = "currently-watching";
      let toSave = {
        ...this.kdrama,
        list,
        dateStart: new Date().toISOString().substring(0, 10),
      };

      this.updateKdrama(toSave)
        .then(() => {
          this.$emit("updateList");
        })
        .finally(() => {
          this.loading = false;
          this.$emit("close");
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.v-card__text {
  > .v-card {
    border: none;
  }
}
</style>
