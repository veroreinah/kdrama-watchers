<template>
  <div
    class="d-flex flex-no-wrap align-center"
    :class="{
      'justify-space-between': card.image,
      'justify-center': !card.image,
      'flex-column':
        ($vuetify.breakpoint.name === 'xs' && card.cols !== 12) || card.column,
      'pb-6': card.data,
    }"
    style="height: 100%"
  >
    <v-avatar
      v-if="card.image && imageFirst"
      class="ma-2"
      :size="imageWidth"
      min-width="auto"
      max-width="90%"
      rounded
    >
      <v-img :src="card.image" contain></v-img>
    </v-avatar>

    <div
      class="
        flex-grow-1
        d-flex
        flex-column
        align-center
        justify-center
        text-center
      "
      style="width: 100%;"
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

      <v-list v-if="card.data" style="width: 100%;">
        <v-list-item v-for="kdrama in card.data" :key="kdrama.id">
          <v-list-item-content>
            <v-list-item-title>{{ kdrama.title }}</v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <div class="text-no-wrap">
              <v-icon
                v-for="(star, key) in kdrama.rating"
                :key="key"
                :color="star.color"
              >
                {{ star.icon }}
              </v-icon>
            </div>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>

    <v-avatar
      v-if="card.image && !imageFirst"
      class="ma-2"
      :size="imageWidth"
      min-width="auto"
      max-width="90%"
      rounded
    >
      <v-img :src="card.image" contain></v-img>
    </v-avatar>
  </div>
</template>

<script>
export default {
  name: "KdramaStatisticsCard",
  props: {
    card: { type: Object, required: true },
    imageFirst: { type: Boolean, default: false },
  },
  computed: {
    imageWidth() {
      if (this.$vuetify.breakpoint.name === "xs") {
        return 125;
      }

      return 250;
    },
  },
};
</script>
