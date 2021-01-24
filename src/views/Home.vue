<template>
  <div class="home pt-5">
    <v-text-field
      v-model="query"
      label="Search next k-drama to watch..."
      outlined
      clearable
      autofocus
      autocomplete="off"
      append-icon="mdi-magnify"
      @keypress.enter="search"
      @click:append="search"
    ></v-text-field>

    <div>
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <div class="row" v-else-if="data && data.length">
        <div
          class="col-12 col-sm-6 col-lg-4"
          v-for="result in data" :key="result.id"
        >
          <v-card outlined tile>
            <div class="d-flex">
              <v-img
                :src="result.image || mobileBg"
                :lazy-src="mobileBg"
                height="200"
                width="140"
                max-width="140"
                gradient="to bottom, rgba(100,115,201,.1), rgba(25,32,72,.5)"
              />

              <div class="flex-grow-1 d-flex flex-column justify-space-between">
                <div>
                  <v-card-title>{{ result.title }}</v-card-title>
                  <div v-if="result.categories" class="pl-4 pr-3">
                    <v-chip
                      v-for="category in result.categories"
                      :key="category"
                      color="primary"
                      outlined
                      small
                      class="mr-1 mb-1"
                    >{{ category }}</v-chip>
                  </div>
                </div>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-menu offset-y left tile>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="primary"
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-plus-circle</v-icon>
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item
                        v-for="action in actions"
                        :key="action.action"
                      >
                        <v-list-item-content>
                          <v-btn
                            text
                            small
                            color="secondary"
                            @click="triggerAction(action.action, result)"
                          >
                            <v-icon left>{{ action.icon }}</v-icon>
                            {{ action.label }}
                          </v-btn>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-actions>
              </div>
            </div>
          </v-card>
        </div>
      </div>

      <div v-else-if="data && !data.length">
        <v-card color="primary" dark>
          <v-card-title class="headline">
            <span>We couldn't find any results that match <strong>"{{ query }}"</strong>.</span>
          </v-card-title>
          <v-card-subtitle>Try another search!</v-card-subtitle>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import mobileBg from '@/assets/img/header-bg-mobile.jpg';

export default {
  name: 'Home',
  data: () => ({
    query: '',
    loading: false,
    data: null,
    mobileBg,
    actions: [
      {
        action: 'wishlist',
        icon: 'mdi-heart-plus',
        label: 'Wishlist',
      },
      {
        action: 'currently-watching',
        icon: 'mdi-eye-plus',
        label: 'Currently watching',
      },
      {
        action: 'already-watched',
        icon: 'mdi-eye-check',
        label: 'Already watched',
      },
    ],
  }),
  watch: {
    query() {
      this.data = null;
    },
  },
  methods: {
    search() {
      if (this.query) {
        this.loading = true;
        axios
          .get(`/api.php?action=query&list=search&srsearch=${this.query}`)
          .then(async result => {
            if (result.data && result.data.query.search.length) {
              const imagesName = [];
              const imagesPerPage = {};

              const data = result.data.query.search.map(item => {
                let imageName = item.snippet.match(/(Archivo:.*)\|thumb/);
                if (!imageName || imageName.length < 2) {
                  imageName = item.snippet.match(/(Imagen:.*)\|thumb/);
                }

                if (imageName && imageName.length >= 2) {
                  imagesName.push(imageName[1]);
                  imagesPerPage[item.pageid] = imageName[1];
                }

                return {
                  id: item.pageid,
                  title: item.title,
                };
              });

              if (imagesName.length) {
                const imagesInfo = await axios.get(`/api.php?action=query&prop=imageinfo&titles=${imagesName.join('|')}&iiprop=url`);

                if (imagesInfo.data && imagesInfo.data.query.pages) {
                  const images = Object.values(imagesInfo.data.query.pages);

                  if (imagesInfo.data.query.normalized.length) {
                    Object.keys(imagesPerPage).forEach(key => {
                      const normalized = imagesInfo.data.query.normalized.find(n => n.from === imagesPerPage[key]);

                      if (normalized && normalized.from && normalized.to) {
                        imagesPerPage[key] = normalized.to;
                      }
                    })
                  }

                  data.forEach(item => {
                    const image = images.find(image => image.title === imagesPerPage[item.id]);
                    if (image && image.imageinfo && image.imageinfo.length) {
                      item['image'] = image.imageinfo[0].url.replace('https://static', 'https://vignette');
                    }
                  });
                }
              }

              const categoriesInfo = await axios.get(`/api.php?action=query&prop=categories&titles=${data.map(d => d.title).join('|')}&cllimit=500`);
              if (categoriesInfo.data && categoriesInfo.data.query.pages) {
                data.forEach(item => {
                  if (categoriesInfo.data.query.pages[item.id] && categoriesInfo.data.query.pages[item.id].categories) {
                    item['categories'] = categoriesInfo.data.query.pages[item.id].categories.map(cat => cat.title.replace('Categoría:', ''));
                  }
                });
              }

              this.data = data;
            } else {
              this.data = [];
            }
            this.loading = false;
          })
          .catch(error => {
            console.error(error);
            this.loading = false;
          });
      }
    },
    triggerAction(action, kdrama) {
      console.log('triggerAction', action, kdrama);
    },
  },
}
</script>
