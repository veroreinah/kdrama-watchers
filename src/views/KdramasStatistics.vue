<template>
  <div class="pt-2 mx-auto" style="max-width: 1185px">
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

      <v-row dense>
        <v-col v-for="(card, idx) in cards" :key="idx" :cols="card.cols">
          <v-card height="100%" :color="card.color" dark>
            <v-img
              v-if="'background' in card"
              :src="
                typeof card.background === 'number'
                  ? bgImages[card.background]
                  : card.background
              "
              :gradient="
                card.data
                  ? 'to top right, rgba(100,115,201,.8), rgba(25,32,72,.8)'
                  : 'to top right, rgba(100,115,201,.6), rgba(25,32,72,.6)'
              "
              :height="getHeight(card)"
              minHeight="100%"
            >
              <KdramaStatisticsCard :card="card" imageFirst />
            </v-img>

            <KdramaStatisticsCard v-else :card="card" />
          </v-card>
        </v-col>
      </v-row>
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
import { statistics } from "@/mixins/statistics";
import KdramaStatisticsCard from "@/components/KdramaStatisticsCard";

import cardBg1 from "@/assets/img/card-bg-1.jpg";
import cardBg2 from "@/assets/img/card-bg-2.jpg";
import cardBg3 from "@/assets/img/card-bg-3.jpg";
import cardBg4 from "@/assets/img/card-bg-4.jpg";
import cardBg5 from "@/assets/img/card-bg-5.jpg";
import cardBg6 from "@/assets/img/card-bg-6.jpg";

export default {
  name: "KdramasStatistics",
  data: () => ({
    loading: false,
    years: [],
    data: undefined,
    selectedYear: undefined,
    bgImages: [cardBg1, cardBg2, cardBg3, cardBg4, cardBg5, cardBg6],
  }),
  computed: {
    ...mapState(["user"]),
    sortedYears() {
      const years = [...this.years];
      years.sort((a, b) => a - b);

      return years;
    },
    cards() {
      const sorted =
        (this.data[this.selectedYear]?.sortedRating && [
          ...this.data[this.selectedYear].sortedRating,
        ]) ||
        [];
      const bestRate = this.data[this.selectedYear].bestRate;

      const cols = this.getCols(sorted.length);

      const cards = this.basicCards.map((card) => {
        const newCard = { ...card };
        const data = this.data[this.selectedYear][newCard.type];
        const kdrama = newCard.type === "sortedRating" && sorted.shift();

        newCard.text = this.cardsText[newCard.type];
        newCard.highlighted =
          newCard.type === "year"
            ? this.selectedYear
            : Array.isArray(data) || newCard.subtype === "list"
            ? data?.length || 0
            : data;
        newCard.emoji = this.cardsEmoji[newCard.type];

        if (kdrama) {
          newCard.highlighted = kdrama.title;
          newCard.image = kdrama.image;
          newCard.emoji = bestRate === kdrama.rating ? "⭐️⭐️⭐️⭐️⭐️" : null;
        }

        if (newCard.type === "sortedRating" && !kdrama) {
          newCard.toRemove = true;
        }

        if (newCard.type === "bestRate" && bestRate === undefined) {
          newCard.toRemove = true;
        }

        if (newCard.type === "already-watched" && newCard.subtype === "all") {
          if (Array.isArray(data) && data.length) {
            newCard.highlighted = `${newCard.text} ${this.selectedYear}`;
            newCard.text = undefined;
            newCard.emoji = undefined;
            newCard.data = data
              .sort((a, b) => {
                return b.rating - a.rating;
              })
              .map((kdrama) => ({
                id: kdrama.id,
                title: kdrama.title,
                rating: this.getkdramaRating(kdrama.rating / 2),
              }));
          } else {
            newCard.toRemove = true;
          }
        }

        return newCard;
      });

      return cards
        .filter((card) => !card.toRemove)
        .map((card, idx) => ({ ...card, cols: cols[idx] }));
    },
  },
  watch: {
    sortedYears(value) {
      if (value && value.length) {
        this.selectedYear = this.sortedYears[this.sortedYears.length - 1];
      }
    },
    selectedYear() {
      const images = [cardBg1, cardBg2, cardBg3, cardBg4, cardBg5, cardBg6];
      images.sort(() => Math.random() - 0.5);

      this.bgImages = [...images];
    },
  },
  components: {
    KdramaStatisticsCard,
  },
  mixins: [kdramas, tools, statistics],
  methods: {
    prev() {
      const currentIndex = this.sortedYears.indexOf(this.selectedYear);

      this.selectedYear = this.sortedYears[currentIndex - 1];
    },
    next() {
      const currentIndex = this.sortedYears.indexOf(this.selectedYear);

      this.selectedYear = this.sortedYears[currentIndex + 1];
    },
    getHeight(card) {
      if (card.subtype === "all") {
        return "auto";
      }

      if (this.$vuetify.breakpoint.name === "xs") {
        return card.image && card.cols !== 12 ? "auto" : 200;
      }

      return 300;
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

            const kdramaData = {
              id: kdrama.id,
              title: kdrama.title,
              image: kdrama.image,
              list: kdrama.list,
              episodes: kdrama.episodes,
              genre: kdrama.genre,
              rating: kdrama.rating,
              yearAdded,
              dates: kdrama.watchDates
                ? kdrama.watchDates.map((dates) => ({
                    ...dates,
                    yearStarted: dates.dateStart
                      ? new Date(dates.dateStart).getFullYear()
                      : null,
                    yearEnded: dates.dateEnd
                      ? new Date(dates.dateEnd).getFullYear()
                      : null,
                  }))
                : null,
            };

            this.setYearData(kdramaData);
          });

          this.setSortedKdramasData();
        })
        .finally(() => (this.loading = false));
    },
    getkdramaRating(rating) {
      const result = [];
      for (let index = 0; index < 5; index++) {
        let icon = "mdi-star";
        let color = "warning";
        if (rating < index + 1) {
          if (rating > index) {
            icon = "mdi-star-half-full";
          } else {
            icon = "mdi-star-outline";
            color = "#bdbdbd";
          }
        }

        result.push({ icon, color });
      }

      return result;
    },
  },
  created() {
    this.getData();
  },
};
</script>

<style lang="scss" scoped>
.v-image {
  ::v-deep {
    .v-responsive__sizer {
      padding-bottom: 0 !important;
    }

    .theme--dark.v-list {
      background: none;
    }
  }
}
</style>
