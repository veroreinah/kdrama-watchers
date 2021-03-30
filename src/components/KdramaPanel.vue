<template>
  <div>
    <v-expansion-panel-header hide-actions class="pa-0">
      <KdramaCard :kdrama="kdrama" small hide-actions />
    </v-expansion-panel-header>

    <v-expansion-panel-content class="pt-5">
      <KdramaDates v-if="kdrama.dateStart" :kdrama="kdrama" />

      <template v-for="item in kdramaData">
        <template v-if="kdrama[item.key]">
          <div :key="item.key" class="mb-1">
            <h3>{{ item.label }}</h3>
            <div v-html="getFormattedText(kdrama[item.key])"></div>
          </div>
        </template>
      </template>
      <div v-if="kdrama.trivia" class="mb-1">
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
    kdramaData: [
      {
        label: 'Episodios',
        key: 'episodes',
      },
      {
        label: 'Sinopsis',
        key: 'synopsis',
      },
    ]
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
