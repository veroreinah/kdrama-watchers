<template>
  <div class="home pt-5">
    <v-text-field
      v-model="query"
      label="Search next k-drama to watch..."
      outlined
      clearable
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
          class="col-12 col-sm-6 col-md-4 col-lg-3"
          v-for="result in data" :key="result.id"
        >
          <v-card elevation="2" tile>
            <v-img
              :src="result.image || mobileBg"
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
            >
              <v-card-title v-text="result.title"></v-card-title>
            </v-img>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn icon>
                <v-icon>mdi-information</v-icon>
              </v-btn>

              <v-btn icon>
                <v-icon>mdi-eye</v-icon>
              </v-btn>

              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
            </v-card-actions>
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
                const imageName = item.snippet.match(/(Archivo:.*)\|thumb/);
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
                      item['image'] = `${image.imageinfo[0].url}&origin=*`;
                    }
                  });
                }
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
  },
}
</script>
