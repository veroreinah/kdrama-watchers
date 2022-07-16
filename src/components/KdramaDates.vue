<template>
  <div class="d-flex align-center mb-2">
    <v-icon left small color="secondary">mdi-calendar-heart</v-icon>
    <span>
      {{ formatDate(watchDates.dateStart) }}
      <template
        v-if="watchDates.dateEnd && watchDates.dateEnd !== watchDates.dateStart"
      >
        - {{ formatDate(watchDates.dateEnd) }}
      </template>
    </span>

    <v-dialog v-model="dialog" max-width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          fab
          depressed
          x-small
          color="secondary"
          v-bind="attrs"
          v-on="on"
          class="ml-2"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-toolbar color="secondary" dark>Fechas</v-toolbar>

        <v-card-text class="pa-5">
          <div class="d-flex justify-center">
            <v-date-picker
              v-model="dates"
              no-title
              :range="Array.isArray(dates)"
              locale="es"
              first-day-of-week="1"
              :max="parseDate(new Date())"
            ></v-date-picker>
          </div>

          <v-alert v-if="error" text tile type="error">{{ error }}</v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn depressed tile @click="dialog = false"> Cancelar </v-btn>
          <v-btn
            depressed
            tile
            color="secondary"
            :loading="loading"
            @click="updateDates"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: "KdramaDates",
  props: {
    kdrama: { type: Object, required: true },
    watchDates: { type: Object, required: true },
  },
  data: () => ({
    loading: false,
    error: undefined,
    dialog: false,
    dates: [],
  }),
  mixins: [kdramas, tools],
  methods: {
    validateDates() {
      if (Array.isArray(this.dates)) {
        return this.dates.length === 2;
      } else {
        return this.dates;
      }
    },
    updateDates() {
      this.loading = true;

      if (this.validateDates()) {
        let toSave;
        let dateStart = null;
        let dateEnd = null;

        if (Array.isArray(this.dates)) {
          if (new Date(this.dates[0]) > new Date(this.dates[1])) {
            dateStart = this.dates[1];
            dateEnd = this.dates[0];
          } else {
            dateStart = this.dates[0];
            dateEnd = this.dates[1];
          }
        } else {
          dateStart = this.dates;
        }

        toSave = {
          ...this.kdrama,
          watchDates: this.kdrama.watchDates.map((watch) => {
            if (watch.id === this.watchDates.id) {
              return {
                ...watch,
                dateStart,
                dateEnd,
              };
            } else {
              return watch;
            }
          }),
        };

        this.updateKdrama(toSave)
          .then(() => {
            this.$emit("updateList");
          })
          .finally(() => {
            this.loading = false;
            this.dialog = false;
          });
      } else {
        this.error = "Las fechas no son correctas";
        this.loading = false;
      }
    },
  },
  created() {
    if (this.watchDates.dateStart) {
      if (this.watchDates.dateEnd) {
        this.dates.push(this.watchDates.dateStart);
        this.dates.push(this.watchDates.dateEnd);
      } else {
        this.dates = this.watchDates.dateStart;
      }
    }
  },
};
</script>
