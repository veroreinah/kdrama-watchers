<template>
  <div class="pt-2">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <template v-else-if="years && years.length">
      <v-toolbar flat height="auto">
        <v-spacer></v-spacer>

        <v-btn
          fab
          text
          small
          color="grey darken-2"
          @click="prev"
          :disabled="selectedYear === sortedYears[0]"
        >
          <v-icon> mdi-chevron-left </v-icon>
        </v-btn>
        <v-btn
          fab
          text
          small
          color="grey darken-2"
          @click="next"
          :disabled="selectedYear === sortedYears[sortedYears.length - 1]"
        >
          <v-icon> mdi-chevron-right </v-icon>
        </v-btn>
      </v-toolbar>

      <v-container fluid>
        <v-row dense>
          <v-col v-for="(card, idx) in cards" :key="idx" :cols="card.flex">
            <v-card
              height="100%"
              :color="card.color"
              dark
              class="d-flex flex-column justify-center align-center text-center"
            >
              <v-img
                v-if="card.background"
                :src="card.background"
                gradient="to top right, rgba(100,115,201,.6), rgba(25,32,72,.6)"
                :height="cardHeight"
              >
                <div
                  class="d-flex flex-column justify-center align-center"
                  style="height: 100%"
                >
                  <v-card-subtitle v-if="card.text" class="pb-0">
                    {{ card.text }}
                  </v-card-subtitle>
                  <v-card-title>
                    {{ card.highlighted }}
                  </v-card-title>
                  <v-card-text v-if="card.emoji" class="text-center">
                    {{ card.emoji }}
                  </v-card-text>
                </div>
              </v-img>

              <template v-else>
                <v-card-subtitle v-if="card.text" class="pb-0">
                  {{ card.text }}
                </v-card-subtitle>
                <v-card-title>
                  {{ card.highlighted }}
                </v-card-title>
                <v-card-text v-if="card.emoji" class="text-center">
                  {{ card.emoji }}
                </v-card-text>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
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
import cardBg1 from "@/assets/img/card-bg-1.jpg";
import cardBg2 from "@/assets/img/card-bg-2.jpg";
import cardBg3 from "@/assets/img/card-bg-3.jpg";
import cardBg4 from "@/assets/img/card-bg-4.jpg";
import cardBg5 from "@/assets/img/card-bg-5.jpg";
import cardBg6 from "@/assets/img/card-bg-6.jpg";
import cardBg7 from "@/assets/img/card-bg-7.jpg";

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
    cardHeight() {
      if (this.$vuetify.breakpoint.name === "xs") {
        return 200;
      }

      return 300;
    },
    cards() {
      const result = [];
      const added = this.data[this.selectedYear].added || [];
      const started = this.data[this.selectedYear].started || [];
      const watched = this.data[this.selectedYear]["already-watched"] || [];
      const abandoned = this.data[this.selectedYear].abandoned || [];
      const bestRated = this.data[this.selectedYear].bestRated || [];

      const images = [
        cardBg1,
        cardBg2,
        cardBg3,
        cardBg4,
        cardBg5,
        cardBg6,
        cardBg7,
      ];
      images.sort(() => Math.random() - 0.5);

      result.push({
        text: "Kdramas del año",
        highlighted: this.selectedYear,
        background: images[0],
        flex: 4,
      });

      if (bestRated.length) {
        result.push({
          highlighted: bestRated[0].title,
          emoji: "⭐️⭐️⭐️⭐️⭐️",
          background: bestRated[0].image,
          flex: 8,
        });
      }

      result.push({
        text: "Vistos",
        highlighted: watched.length,
        emoji: "🎉",
        background: images[1],
        flex: 6,
      });

      result.push({
        text: "Mejor valoración",
        highlighted: this.data[this.selectedYear].bestRate,
        emoji: "⭐️⭐️⭐️⭐️⭐️",
        color: "primary",
        flex: 6,
      });

      if (bestRated.length > 1) {
        result.push({
          highlighted: bestRated[1].title,
          emoji: "⭐️⭐️⭐️⭐️⭐️",
          background: bestRated[1].image,
          flex: 12,
        });
      }

      result.push({
        text: "Añadidos",
        highlighted: added.length,
        color: "secondary",
        flex: 4,
      });

      result.push({
        text: "Empezados",
        highlighted: started.length,
        background: images[2],
        flex: 4,
      });

      result.push({
        text: "Abandonados",
        highlighted: abandoned.length,
        emoji: "💔",
        color: "accent",
        flex: 4,
      });

      return result;
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

          this.years.forEach((year) => {
            const yearWatchedKdramas = this.data[year]["already-watched"]
              .filter((kdrama) => kdrama.rating !== null)
              .map((kdrama) => ({
                title: kdrama.title,
                rating: kdrama.rating,
              }));

            if (yearWatchedKdramas.length) {
              yearWatchedKdramas.sort((a, b) => b.rating - a.rating);
              const bestRate = yearWatchedKdramas[0].rating;

              this.data[year].bestRate = bestRate;
              this.data[year].bestRated = this.data[year][
                "already-watched"
              ].filter((kdrama) => kdrama.rating === bestRate);
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
