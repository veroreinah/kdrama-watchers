<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    @click:outside="$emit('close')"
  >
    <v-card>
      <v-card-text v-if="kdrama" class="pa-0">
        <KdramaCard :kdrama="kdrama" hide-actions />
        <div v-if="kdrama.synopsis" v-html="getFormattedText(kdrama.synopsis)" class="px-4 py-2"></div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          depressed
          tile
          @click="$emit('close')"
        >
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
import firebase from "firebase/app";
import "firebase/firestore";
import KdramaCard from '@/components/KdramaCard';
import { tools } from "@/mixins/tools";
import { mapActions } from 'vuex';

export default {
  name: 'KdramaDialog',
  props: {
    open: { type: Boolean, default: false },
    kdrama: { type: Object },
  },
  data: () => ({
    db: undefined,
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
  mixins: [
    tools,
  ],
  methods: {
    ...mapActions(["setSnackbar"]),
    moveKdrama() {
      this.loading = true;
      const list = 'currently-watching';
      let toSave = { ...this.kdrama, list, dateStart: (new Date()).toISOString().substr(0, 10) };

      this.db.collection('kdramas').doc(this.kdrama.id).set(toSave)
        .then(() => {
          this.setSnackbar({
            msg: `Kdrama "${this.kdrama.title}" actualizado correctamente.`,
            color: "success",
            timeout: 5000
          });
          
          this.$emit('updateList');
        })
        .catch(error => {
          console.error(error);
          this.setSnackbar({
            msg: "Ha habido un error al mover el kdrama a la lista seleccionada.",
            color: "error",
            timeout: 10000
          });
        })
        .finally(() => {
          this.loading = false;
          this.$emit('close');
        });
    },
  },
  created() {
    this.db = firebase.firestore();
  },
}
</script>

<style lang="scss" scoped>
.v-card__text {
  > .v-card {
    border: none;
  }
}
</style>
