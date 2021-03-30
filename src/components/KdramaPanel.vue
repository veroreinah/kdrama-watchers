<template>
  <div>
    <v-expansion-panel-header hide-actions class="pa-0">
      <div class="d-flex align-sm-center justify-space-between">
        <KdramaCard :kdrama="kdrama" small hide-actions />

        <div v-if="actions[kdrama.list]" class="pa-4 d-flex flex-column d-sm-block">
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
        </div>
      </div>
    </v-expansion-panel-header>

    <v-expansion-panel-content class="pt-5">
      <KdramaDates v-if="kdrama.dateStart" :kdrama="kdrama" />

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
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    },
    getDateTime(date) {
      const kdramaDate = new Date(date);
      return `${this.formatDate(kdramaDate.toISOString().substr(0, 10))}
        ${kdramaDate.toISOString().substr(11, 8)}`;
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
            msg: `El kdrama "${this.kdrama.title}" se ha actualizado correctamente.`,
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
