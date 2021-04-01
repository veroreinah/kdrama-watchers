<template>
  <div>
    <v-expansion-panel-header hide-actions class="pa-0">
      <div class="d-flex align-sm-center justify-space-between">
        <KdramaCard :kdrama="kdrama" small hide-actions />

        <div class="pa-4 d-flex flex-column d-sm-block text-no-wrap">
          <template v-if="actions[kdrama.list]">
            <v-btn
              v-for="action in actions[kdrama.list]"
              :key="action.action"
              fab
              depressed
              x-small
              color="secondary"
              :loading="currentAction === action.action && loading"
              :disabled="loading"
              @click.stop="moveKdrama(action.action)"
              class="ml-1 ml-sm-2 mb-1 mb-sm-0"
            >
              <v-icon>{{ action.icon }}</v-icon>
            </v-btn>
          </template>
          <v-dialog v-model="dialog" max-width="320">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                depressed
                x-small
                color="secondary"
                :loading="currentAction === 'delete' && loading"
                :disabled="loading"
                class="ml-1 ml-sm-2"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-toolbar color="secondary" dark>Eliminar</v-toolbar>
              <v-card-text class="pa-5">
                ¿Seguro que quieres eliminar este kdrama?
                Esta acción no se puede deshacer, pero podrás volver a añadirlo desde el buscador.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  tile
                  depressed
                  @click="dialog = false"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  tile
                  depressed
                  color="secondary"
                  @click="deleteKdrama"
                  :loading="currentAction === 'delete' && loading"
                  :disabled="loading"
                >
                  Aceptar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </div>
    </v-expansion-panel-header>

    <v-expansion-panel-content class="pt-5">
      <KdramaDates v-if="kdrama.dateStart" :kdrama="kdrama" @updateList="$emit('updateList')" />

      <template v-for="item in kdramaData">
        <template v-if="kdrama[item.key]">
          <div :key="item.key" class="mb-4">
            <h3>{{ item.label }}</h3>
            <div v-html="getFormattedText(kdrama[item.key])"></div>
          </div>
        </template>
      </template>
      <div v-if="kdrama.trivia" class="mb-4">
        <h3>Curiosidades</h3>
        <TriviaList :data="kdrama.trivia" />
      </div>
      <div class="text-right text-caption font-italic">
        Añadido: {{ getDateTime(kdrama.dateAdd) }}
      </div>
    </v-expansion-panel-content>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import KdramaCard from '@/components/KdramaCard';
import KdramaDates from '@/components/KdramaDates';
import TriviaList from '@/components/TriviaList';
import mobileBg from '@/assets/img/header-bg-mobile.jpg';
import { mapActions } from 'vuex';

export default {
  name: 'KdramaPanel',
  props: {
    kdrama: { type: Object, required: true },
  },
  data: () => ({
    mobileBg,
    db: undefined,
    loading: false,
    currentAction: undefined,
    dialog: false,
    kdramaData: [
      {
        label: 'Episodios',
        key: 'episodes',
      },
      {
        label: 'Sinopsis',
        key: 'synopsis',
      },
    ],
    actions: {
      wishlist: [
        {
          action: 'currently-watching',
          icon: 'mdi-eye-plus',
        },
        {
          action: 'already-watched',
          icon: 'mdi-eye-check',
        },
        {
          action: 'abandoned',
          icon: 'mdi-heart-off',
        },
      ],
      'currently-watching': [
        {
          action: 'already-watched',
          icon: 'mdi-eye-check',
        },
        {
          action: 'abandoned',
          icon: 'mdi-heart-off',
        },
      ],
    },
  }),
  components: {
    KdramaCard,
    TriviaList,
    KdramaDates,
  },
  methods: {
    ...mapActions(["setSnackbar"]),
    formatDate(date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day < 10 ? `0${day}` : day}/${month < 10 ? `0${month}` : month}/${year}`;
    },
    getDateTime(date) {
      const kdramaDate = new Date(date);
      return `${this.formatDate(kdramaDate)}
        ${kdramaDate.toLocaleTimeString()}`;
    },
    getFormattedText(text) {
      return text.replaceAll('[[', '<strong>').replaceAll(']]', '</strong>');
    },
    moveKdrama(list) {
      this.loading = true;
      this.currentAction = list;
      let toSave = { ...this.kdrama, list };

      if (list === 'currently-watching') {
        toSave = { ...toSave, dateStart: (new Date()).toISOString().substr(0, 10) };
      } else if (list === 'already-watched' || list === 'abandoned') {
        toSave = { ...toSave, dateEnd: (new Date()).toISOString().substr(0, 10) };
      }

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
          this.currentAction = undefined;
        });
    },
    deleteKdrama() {
      this.loading = true;
      this.currentAction = 'delete';

      this.db.collection('kdramas').doc(this.kdrama.id).delete()
        .then(() => {
          this.setSnackbar({
            msg: `Kdrama "${this.kdrama.title}" eliminado.`,
            color: "success",
            timeout: 5000
          });
          
          this.$emit('updateList');
        })
        .catch(error => {
          console.error(error);
          this.setSnackbar({
            msg: "Ha habido un error al eliminar el kdrama.",
            color: "error",
            timeout: 10000
          });
        })
        .finally(() => {
          this.dialog = false;
          this.loading = false;
          this.currentAction = undefined;
        });
    },
  },
  created() {
    this.db = firebase.firestore();
  },
}
</script>

<style lang="scss" scoped>
.v-expansion-panel-header {
  .v-card {
    border: none;
  }
}
</style>
