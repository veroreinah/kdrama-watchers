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
import firebase from "firebase/app";
import "firebase/firestore";
import { mapActions, mapState } from 'vuex';
import { tools } from "@/mixins/tools";

export default {
  name: 'KdramasCalendar',
  data: () => ({
    loading: false,
    dialog: false,
    kdramasRef: undefined,
    kdramas: [],
    value: '',
    calendarTitle: '',
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    selectedDate: undefined,
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
  },
  mixins: [
    tools,
  ],
  methods: {
    ...mapActions(["setSnackbar"]),
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
      
      this.kdramasRef
        .where("user", "==", this.user.uid)
        .where("list", "!=", "wishlist")
        .get()
        .then(querySnapshot => {
          const kdramas = [];
          querySnapshot.forEach(doc => kdramas.push({ id: doc.id, ...doc.data() }));

          this.kdramas = kdramas.map(kdrama => ({
            name: `${this.getListProp(kdrama.list, 'emoji')} ${kdrama.title}`,
            start: new Date(kdrama.dateStart),
            end: kdrama.dateEnd ? new Date(kdrama.dateEnd) : new Date(),
            color: this.getListProp(kdrama.list, 'color'),
            timed: false,
            data: {...kdrama},
          }));
        })
        .catch(error => {
          console.error(error);
          this.setSnackbar({
            msg: "Ha habido un error al recuperar el listado de kdramas.",
            color: "error",
            timeout: 10000
          });
        })
        .finally(() => this.loading = false);
    },
  },
  created() {
    const db = firebase.firestore();
    this.kdramasRef = db.collection('kdramas');
    this.getData();
  },
  updated() {
    if (this.$refs.calendar) {
      this.calendarTitle = this.$refs.calendar.title;
    }
  },
}
</script>
