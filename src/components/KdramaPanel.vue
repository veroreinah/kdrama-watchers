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
            <template v-if="Array.isArray(kdrama[item.key])">
              <div v-for="(text, key) in kdrama[item.key]" :key="key">
                <v-icon left x-small color="secondary">mdi-checkbox-blank-circle</v-icon>
                <span v-html="getFormattedText(text)"></span>
              </div>
            </template>
            <template v-else>
              <div v-html="getFormattedText(kdrama[item.key])"></div>
            </template>
          </div>
        </template>
      </template>
    </v-expansion-panel-content>
  </div>
</template>

<script>
import KdramaCard from '@/components/KdramaCard';
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
      {
        label: 'Curiosidades',
        key: 'trivia',
      },
    ]
  }),
  components: {
    KdramaCard,
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
