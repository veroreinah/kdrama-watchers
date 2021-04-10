<template>
  <div class="pt-2">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <template v-else-if="kdramas && kdramas.length">
      <v-sheet height="64">
        <v-toolbar flat>
          <v-toolbar-title>
            {{ calendarTitle }}
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
            :disabled="disablePrev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
            :disabled="disableNext"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          locale="es"
          v-model="value"
          color="primary"
          :events="kdramas"
          :event-ripple="false"
          :weekdays="weekdays"
          type="month"
          event-more-text="más kdramas"
          @click:more="clickMore"
        ></v-calendar>
      </v-sheet>
    </template>

    <div v-else-if="kdramas && !kdramas.length">
      <v-card color="primary" dark>
        <v-card-title class="headline">
          <span>No hay ningún kdrama en tu calendario.</span>
        </v-card-title>
      </v-card>
    </div>


    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-toolbar v-if="selectedDate" color="secondary" dark>{{ formatDate(selectedDate) }}</v-toolbar>

        <v-card-text class="pa-5">
          <v-list-item v-for="kdrama in filteredKdramas" :key="kdrama.name">
            <v-list-item-content>
              <v-list-item-title>{{ kdrama.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(kdrama.data.dateStart) }}
                <template v-if="kdrama.data.dateEnd">
                  - {{ formatDate(kdrama.data.dateEnd) }}
                </template>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            depressed
            tile
            color="secondary"
            @click="dialog = false"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: 'KdramasCalendar',
  data: () => ({
    loading: false,
    dialog: false,
    kdramas: [],
    value: '',
    calendarTitle: '',
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    selectedDate: undefined,
    disablePrev: false,
    disableNext: false,
  }),
  computed: {
    ...mapState(["user"]),
    filteredKdramas() {
      if (this.selectedDate) {
        const result = this.kdramas.filter(kdrama => {
          const date = new Date(this.selectedDate);
          return kdrama.start <= date && kdrama.end >= date;
        });
        result.sort((kdramaA, kdramaB) => kdramaB.start - kdramaA.start);
        result.sort((kdramaA, kdramaB) => this.getListProp(kdramaA.data.list, 'value') - this.getListProp(kdramaB.data.list, 'value'));

        return result;
      } else {
        return this.kdramas;
      }
    },
    minDate() {
      let minDate = new Date();
      this.kdramas.forEach(kdrama => {
        if (kdrama.start < minDate) {
          minDate = kdrama.start;
        }
      });

      return minDate;
    },
    maxDate() {
      let maxDate = new Date();
      this.kdramas.forEach(kdrama => {
        if (kdrama.end > maxDate) {
          maxDate = kdrama.end;
        }
      });

      return maxDate;
    },
  },
  mixins: [
    kdramas,
    tools,
  ],
  methods: {
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    clickMore(e) {
      this.selectedDate = e.date;
      this.dialog = true;
    },
    getData() {
      this.loading = true;

      this.getKdramas(this.user, ["!=", "wishlist"])
        .then(kdramas => {
          this.kdramas = kdramas.map(kdrama => ({
            name: `${this.getListProp(kdrama.list, 'emoji')} ${kdrama.title}`,
            start: new Date(kdrama.dateStart),
            end: kdrama.dateEnd ? new Date(kdrama.dateEnd) : new Date(),
            color: this.getListProp(kdrama.list, 'color'),
            timed: false,
            data: {...kdrama},
          }));
        })
        .finally(() => this.loading = false);
    },
  },
  created() {
    this.getData();
  },
  updated() {
    if (this.$refs.calendar) {
      this.calendarTitle = this.$refs.calendar.title;
      
      const start = this.$refs.calendar.lastStart;
      const end = this.$refs.calendar.lastEnd;

      this.disablePrev = (start.month - 1) <= this.minDate.getMonth() && start.year <= this.minDate.getFullYear();
      this.disableNext = (end.month - 1) >= this.maxDate.getMonth() && end.year >= this.maxDate.getFullYear();
    }
  },
}
</script>
