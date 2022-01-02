<template>
  <div class="pt-2">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <template v-else-if="years && years.length">
      <v-sheet height="90">
        <v-toolbar flat height="90">
          <v-toolbar-title>
            Kdramas del año<br />
            <em class="text-h2">{{ selectedYear }}</em>
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
            :disabled="selectedYear === sortedYears[0]"
            align-self-start
          >
            <v-icon small> mdi-chevron-left </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
            :disabled="selectedYear === sortedYears[sortedYears.length - 1]"
          >
            <v-icon small> mdi-chevron-right </v-icon>
          </v-btn>
        </v-toolbar>
      </v-sheet>

      <div v-if="data[selectedYear].added">
        Añadidos: {{ data[selectedYear].added.length }}
      </div>
      <div v-if="data[selectedYear].started">
        Empezados: {{ data[selectedYear].started.length }}
      </div>
      <div v-if="data[selectedYear]['already-watched']">
        Vistos: {{ data[selectedYear]["already-watched"].length }}
      </div>
      <div v-if="data[selectedYear].bestRate">
        Mejor valorados ({{ data[selectedYear].bestRate }}):
        <ul>
          <li v-for="kdrama in data[selectedYear].bestRated" :key="kdrama.id">
            {{ kdrama.title }}
          </li>
        </ul>
      </div>
      <div v-if="data[selectedYear].abandoned">
        Abandonados: {{ data[selectedYear].abandoned.length }}
      </div>
    </template>

    <div v-else-if="years && !years.length">
      <v-card color="primary" dark>
        <v-card-title class="headline">
          <span>No hay datos para mostrar estadísticas.</span>
        </v-card-title>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: "KdramasStatistics",
  data: () => ({
    loading: false,
    years: [],
    data: undefined,
    selectedYear: undefined,
  }),
  computed: {
    ...mapState(["user"]),
    sortedYears() {
      const years = [...this.years];
      years.sort((a, b) => a - b);

      return years;
    },
  },
  watch: {
    sortedYears(value) {
      if (value && value.length) {
        this.selectedYear = this.sortedYears[this.sortedYears.length - 1];
      }
    },
  },
  mixins: [kdramas, tools],
  methods: {
    prev() {
      const currentIndex = this.sortedYears.indexOf(this.selectedYear);

      this.selectedYear = this.sortedYears[currentIndex - 1];
    },
    next() {
      const currentIndex = this.sortedYears.indexOf(this.selectedYear);

      this.selectedYear = this.sortedYears[currentIndex + 1];
    },
    getData() {
      this.loading = true;

      this.getKdramas(this.user)
        .then((kdramas) => {
          if (!this.data) {
            this.data = {};
          }

          kdramas.forEach((kdrama) => {
            const yearAdded = new Date(kdrama.dateAdd).getFullYear();
            const yearStarted = kdrama.dateStart
              ? new Date(kdrama.dateStart).getFullYear()
              : null;
            const yearEnded = kdrama.dateEnd
              ? new Date(kdrama.dateEnd).getFullYear()
              : null;

            const kdramaData = {
              id: kdrama.id,
              title: kdrama.title,
              image: kdrama.image,
              list: kdrama.list,
              episodes: kdrama.episodes,
              genre: kdrama.genre,
              rating: kdrama.rating,
              yearAdded,
              yearStarted,
              yearEnded,
            };

            this.setYearData(kdramaData);
          });

          console.log("años", this.years);
          console.log("data", this.data);

          this.years.forEach((year) => {
            const yearKdramas = this.data[year].kdramas
              .filter((kdrama) => kdrama.rating !== null)
              .map((kdrama) => ({
                title: kdrama.title,
                rating: kdrama.rating,
              }));

            if (yearKdramas.length) {
              yearKdramas.sort((a, b) => b.rating - a.rating);
              const bestRate = yearKdramas[0].rating;

              this.data[year].bestRate = bestRate;
              this.data[year].bestRated = this.data[year].kdramas.filter(
                (kdrama) => kdrama.rating === bestRate
              );
            }
          });
        })
        .finally(() => (this.loading = false));
    },

    setYearData(kdrama) {
      const { yearAdded, yearStarted, yearEnded, list } = kdrama;

      yearAdded && this.addYear(yearAdded, "added", kdrama);
      yearStarted && this.addYear(yearStarted, "started", kdrama);
      yearEnded && this.addYear(yearEnded, list, kdrama);
    },

    addYear(year, list, kdrama) {
      if (!this.years.includes(year)) {
        this.years.push(year);
      }

      if (!this.data[year]) {
        this.data[year] = {
          kdramas: [],
          [list]: [],
        };
      }

      if (!this.data[year][list]) {
        this.data[year] = { ...this.data[year], [list]: [] };
      }

      const alreadyAdded = this.data[year].kdramas.some(
        (addedKdrama) => addedKdrama.id === kdrama.id
      );

      if (!alreadyAdded) {
        this.data[year].kdramas = [...this.data[year].kdramas, kdrama];
      }
      this.data[year][list] = [...this.data[year][list], kdrama];
    },
  },
  created() {
    this.getData();
  },
};
</script>
