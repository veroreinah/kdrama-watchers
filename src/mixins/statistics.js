import cardBg1 from "@/assets/img/card-bg-1.jpg";
import cardBg2 from "@/assets/img/card-bg-2.jpg";
import cardBg3 from "@/assets/img/card-bg-3.jpg";
import cardBg4 from "@/assets/img/card-bg-4.jpg";
import cardBg5 from "@/assets/img/card-bg-5.jpg";
import cardBg6 from "@/assets/img/card-bg-6.jpg";
import cardBg7 from "@/assets/img/card-bg-7.jpg";

export const statistics = {
  data: () => ({
    cardsText: {
      year: "Kdramas del año",
      bestRate: "Mejor valoración",
      "already-watched": "Vistos",
      added: "Añadidos",
      started: "Empezados",
      abandoned: "Abandonados",
    },

    cardsEmoji: {
      bestRate: "⭐️⭐️⭐️⭐️⭐️",
      "already-watched": "🎉",
      abandoned: "💔",
    },
  }),

  computed: {
    images() {
      const images = [cardBg1, cardBg2, cardBg3, cardBg4, cardBg5, cardBg6];
      images.sort(() => Math.random() - 0.5);

      return images
    },

    basicCards() {
      return [
        { type: "year", background: this.images[0] },
        { type: "sortedRating", color: "accent" },
        { type: "already-watched", color: "secondary" },
        { type: "bestRate", background: this.images[1] },
        { type: "sortedRating", color: "primary" },
        { type: "sortedRating", background: cardBg7 },
        { type: "sortedRating", color: "info", column: true },
        { type: "sortedRating", color: "accent" },
        { type: "sortedRating", color: "primary" },
        { type: "added", color: "secondary" },
        { type: "started", background: this.images[2] },
        { type: "abandoned", color: "accent" },
      ]
    }
  },

  methods: {
    getCols(length) {
      let cols
      switch (length) {
        case 0:
          cols = [4, 4, 4, 4, 4, 4];
          break;
        case 1:
          cols = [4, 8, 6, 6, 4, 4, 4];
          break;
        case 2:
          cols = [4, 8, 6, 6, 12, 4, 4, 4];
          break;
        case 3:
          cols = [4, 8, 6, 6, 12, 12, 4, 4, 4];
          break;
        case 4:
          cols = [4, 8, 6, 6, 12, 8, 4, 4, 4, 4];
          break;
        case 5:
          cols = [4, 8, 6, 6, 12, 8, 4, 12, 4, 4, 4];
          break;
        default:
          cols = [4, 8, 6, 6, 12, 8, 4, 6, 6, 4, 4, 4];
          break;
      }

      return cols
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

    setSortedKdramasData() {
      this.years.forEach((year) => {
        const yearWatchedKdramas = this.data[year][
          "already-watched"
        ].filter((kdrama) => kdrama.rating !== null);

        if (yearWatchedKdramas.length) {
          yearWatchedKdramas.sort((a, b) => b.rating - a.rating);
          const bestRate = yearWatchedKdramas[0].rating;

          this.data[year].bestRate = bestRate;
          this.data[year].bestRated = this.data[year][
            "already-watched"
          ].filter((kdrama) => kdrama.rating === bestRate);
          this.data[year].sortedRating = [...yearWatchedKdramas];
        }
      });
    },
  },
};
