<template>
  <div>
    <v-expansion-panel-header hide-actions class="pa-0">
      <KdramaCard :kdrama="kdrama" small hide-actions />
    </v-expansion-panel-header>

    <v-expansion-panel-content class="pt-5">
      <div v-if="kdrama.dateStart" class="d-flex mb-2">
        <v-icon left small color="secondary">mdi-calendar-heart</v-icon>
        <span>
          {{ getDate(kdrama.dateStart) }}
          <template v-if="kdrama.dateEnd">
            - {{ getDate(kdrama.dateEnd) }}
          </template>
        </span>
      </div>
      <template v-for="item in kdramaData">
        <template v-if="kdrama[item.key]">
          <div :key="item.key" class="mb-1">
            <h3>{{ item.label }}</h3>
            <div v-html="getFormattedText(kdrama[item.key])"></div>
          </div>
        </template>
      </template>
      <div v-if="kdrama.trivia">
        <h3>Curiosidades</h3>
        <TriviaList :data="kdrama.trivia" />
      </div>
    </v-expansion-panel-content>
  </div>
</template>

<script>
import KdramaCard from '@/components/KdramaCard';
import TriviaList from '@/components/TriviaList';
import mobileBg from '@/assets/img/header-bg-mobile.jpg';

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
  },
  methods: {
    getDate(date) {
      const kdramaDate = new Date(date);
      return `${kdramaDate.getDate()}/${kdramaDate.getMonth() < 9 ? '0' : ''}${kdramaDate.getMonth() + 1}/${kdramaDate.getFullYear()}`;
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
