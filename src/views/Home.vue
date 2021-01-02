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

      <div v-else-if="data && data.length">
        <div v-for="result in data" :key="result.id">
          {{ result.id }} - {{ result.title }}
          <br>
          <img v-if="result.image" :src="result.image" />
        </div>
      </div>

      <div v-else-if="data && !data.length">
        no data
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data: () => ({
    query: '',
    loading: false,
    data: null,
  }),
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
