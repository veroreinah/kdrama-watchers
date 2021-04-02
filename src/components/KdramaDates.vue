<template>
  <div class="d-flex align-center mb-2">
    <v-icon left small color="secondary">mdi-calendar-heart</v-icon>
    <span>
      {{ formatDate(kdrama.dateStart) }}
      <template v-if="kdrama.dateEnd">
        - {{ formatDate(kdrama.dateEnd) }}
      </template>
    </span>

    <v-dialog
      v-model="dialog"
      max-width="500"
    >
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

          <v-alert
            v-if="error"
            text
            tile
            type="error"
          >{{ error }}</v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            depressed
            tile
            @click="dialog = false"
          >
            Cancelar
          </v-btn>
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
import firebase from "firebase/app";
import "firebase/firestore";
import { mapActions } from 'vuex';
import { tools } from "@/mixins/tools";

export default {
  name: 'KdramaDates',
  props: {
    kdrama: { type: Object, required: true },
  },
  data: () => ({
    db: undefined,
    loading: false,
    error: undefined,
    dialog: false,
    dates: [],
  }),
  mixins: [
    tools,
  ],
  methods: {
    ...mapActions(["setSnackbar"]),
    validateDates() {
      if (Array.isArray(this.dates))
        return this.dates.length === 2;
      else
        return this.dates;
    },
    updateDates() {
      this.loading = true;

      if (this.validateDates()) {
        let toSave;

        if (Array.isArray(this.dates)) {
          if (new Date(this.dates[0]) > new Date(this.dates[1])) {
            toSave = { ...this.kdrama, dateStart: this.dates[1], dateEnd: this.dates[0] };
          } else {
            toSave = { ...this.kdrama, dateStart: this.dates[0], dateEnd: this.dates[1] };
          }
        } else {
          toSave = { ...this.kdrama, dateStart: this.dates };
        }

        this.db.collection('kdramas').doc(this.kdrama.id).set(toSave)
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${toSave.title}" actualizado correctamente.`,
              color: "success",
              timeout: 5000
            });

            this.$emit('updateList');
          })
          .catch(error => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al actualizar los datos de este kdrama.",
              color: "error",
              timeout: 10000
            });
          })
          .finally(() => {
            this.loading = false
            this.dialog = false;
          });
      } else {
        this.error = 'Las fechas no son correctas';
        this.loading = false;
      }
    },
  },
  created() {
    this.db = firebase.firestore();

    if (this.kdrama.dateStart) {
      if (this.kdrama.dateEnd) {
        this.dates.push(this.kdrama.dateStart);
        this.dates.push(this.kdrama.dateEnd);
      } else {
        this.dates = this.kdrama.dateStart;
      }
    }
  },
}
</script>
