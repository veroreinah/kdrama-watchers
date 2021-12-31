<template>
  <div>
    <v-expansion-panel-header hide-actions class="pa-0">
      <div class="d-flex align-sm-center justify-space-between">
        <KdramaCard :kdrama="kdrama" small hide-actions>
          <template v-if="kdrama.list !== 'wishlist'" v-slot:afterTitle>
            <div class="text-no-wrap ml-sm-2">
              <v-icon
                v-for="(star, key) in kdramaRating"
                :key="key"
                :color="star.color"
                @click.stop="changeRating((key + 1) * 2)"
                >{{ star.icon }}</v-icon
              >
              <v-btn
                v-if="rating !== kdrama.rating"
                fab
                depressed
                x-small
                color="secondary"
                :loading="currentAction === 'rating' && loading"
                :disabled="loading"
                @click.stop="rateKdrama"
                class="ml-1 ml-sm-2"
              >
                <v-icon>mdi-content-save</v-icon>
              </v-btn>
            </div>
          </template>
        </KdramaCard>

        <div
          class="px-2 px-sm-4 py-4 d-flex flex-column d-sm-block text-no-wrap"
        >
          <template v-if="kdramaActions && kdramaActions.length">
            <v-btn
              v-for="action in kdramaActions"
              :key="action.action"
              fab
              depressed
              x-small
              color="secondary"
              :loading="currentAction === action.action && loading"
              :disabled="loading"
              @click.stop="moveKdrama(action.action)"
              class="ml-1 ml-sm-2 mb-1 mb-sm-0"
            >
              <v-icon>{{ action.icon }}</v-icon>
            </v-btn>
          </template>
          <v-dialog v-model="dialog" max-width="320">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                depressed
                x-small
                color="primary"
                :loading="currentAction === 'delete' && loading"
                :disabled="loading"
                class="ml-1 ml-sm-2"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-toolbar color="primary" dark>Eliminar</v-toolbar>
              <v-card-text class="pa-5">
                ¿Seguro que quieres eliminar este kdrama? Esta acción no se
                puede deshacer, pero podrás volver a añadirlo desde el buscador.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn tile depressed @click="dialog = false"> Cancelar </v-btn>
                <v-btn
                  tile
                  depressed
                  color="primary"
                  @click="removeKdrama"
                  :loading="currentAction === 'delete' && loading"
                  :disabled="loading"
                >
                  Aceptar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </div>
    </v-expansion-panel-header>

    <v-expansion-panel-content class="pt-5">
      <KdramaDates
        v-if="kdrama.dateStart"
        :kdrama="kdrama"
        @updateList="$emit('updateList')"
      />

      <template v-for="item in kdramaData">
        <div v-if="kdrama[item.key]" :key="item.key" class="mb-4">
          <h3>{{ item.label }}</h3>
          <div v-html="getFormattedText(kdrama[item.key])"></div>
        </div>
      </template>
      <div v-if="kdrama.trivia && kdrama.trivia.length" class="mb-4">
        <h3>Curiosidades</h3>
        <TriviaList :data="kdrama.trivia" />
      </div>
      <div class="text-right text-caption font-italic">
        Añadido: {{ getDateTime(kdrama.dateAdd) }}
        <template v-if="kdrama.dateUpdated">
          - Última actualización: {{ getDateTime(kdrama.dateUpdated) }}
        </template>
      </div>
    </v-expansion-panel-content>
  </div>
</template>

<script>
import KdramaCard from "@/components/KdramaCard";
import KdramaDates from "@/components/KdramaDates";
import TriviaList from "@/components/TriviaList";
import { kdramas } from "@/mixins/kdramas";
import { tools } from "@/mixins/tools";

export default {
  name: "KdramaPanel",
  props: {
    kdrama: { type: Object, required: true },
  },
  data: () => ({
    loading: false,
    currentAction: undefined,
    dialog: false,
    kdramaData: [
      {
        label: "Episodios",
        key: "episodes",
      },
      {
        label: "Emisión",
        key: "broadcastDate",
      },
      {
        label: "Sinopsis",
        key: "synopsis",
      },
    ],
    rating: 0,
    kdramaRating: [],
  }),
  computed: {
    kdramaActions() {
      return this.availableLists.filter((list) => {
        return (
          list.actionInLists &&
          list.actionInLists.includes(this.kdrama.list) &&
          !this.kdrama.comingSoon
        );
      });
    },
  },
  components: {
    KdramaCard,
    TriviaList,
    KdramaDates,
  },
  mixins: [kdramas, tools],
  methods: {
    changeRating(rating) {
      if (this.rating === rating) {
        this.rating = rating - 1;
      } else if (rating === 2 && this.rating === 1) {
        this.rating = 0;
      } else {
        this.rating = rating;
      }
      this.setkdramaRating(this.rating / 2);
    },
    setkdramaRating(rating) {
      const result = [];
      const kdramaRating =
        rating || (this.kdrama.rating ? this.kdrama.rating / 2 : 0);
      for (let index = 0; index < 5; index++) {
        let icon = "mdi-star";
        let color = "warning";
        if (kdramaRating < index + 1) {
          if (kdramaRating > index) {
            icon = "mdi-star-half-full";
          } else {
            icon = "mdi-star-outline";
            color = "#bdbdbd";
          }
        }

        result.push({ icon, color });
      }

      this.kdramaRating = result;
    },
    moveKdrama(list) {
      this.loading = true;
      this.currentAction = list;
      let toSave = { ...this.kdrama, list };

      if (list === "currently-watching") {
        toSave = {
          ...toSave,
          dateStart: new Date().toISOString().substr(0, 10),
        };
      } else if (list === "already-watched" || list === "abandoned") {
        toSave = { ...toSave, dateEnd: new Date().toISOString().substr(0, 10) };
      }

      this.updateKdrama(toSave)
        .then(() => {
          this.$emit("updateList");
        })
        .finally(() => {
          this.loading = false;
          this.currentAction = undefined;
        });
    },
    rateKdrama() {
      this.loading = true;
      this.currentAction = "rating";

      const toSave = { ...this.kdrama, rating: this.rating };

      this.updateKdrama(toSave)
        .then(() => {
          this.kdrama.rating = this.rating;
        })
        .finally(() => {
          this.loading = false;
          this.currentAction = undefined;
        });
    },
    removeKdrama() {
      this.loading = true;
      this.currentAction = "delete";

      this.deleteKdrama(this.kdrama)
        .then(() => {
          this.$emit("updateList");
        })
        .finally(() => {
          this.dialog = false;
          this.loading = false;
          this.currentAction = undefined;
        });
    },
  },
  created() {
    this.rating = this.kdrama.rating;
    this.setkdramaRating();
  },
};
</script>

<style lang="scss" scoped>
.v-expansion-panel-header {
  .v-card {
    border: none;
  }
}
</style>
