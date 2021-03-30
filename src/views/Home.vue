<template>
  <div class="home pt-5">
    <v-text-field
      v-model="query"
      label="Search k-drama..."
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
          <KdramaCard :kdrama="result" :hideIds="addedKdramas" @updateList="getKdramas" />
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

    <Login v-if="!user" />
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from "vuex";
import KdramaCard from '@/components/KdramaCard';
import Login from '@/components/Login';
import firebase from "firebase/app";
import "firebase/firestore";

export default {
  name: 'Home',
  data: () => ({
    query: '',
    loading: false,
    data: null,
    db: undefined,
    addedKdramas: [],
  }),
  computed: {
    ...mapState(["user"]),
  },
  watch: {
    query() {
      this.data = null;
    },
  },
  components: {
    KdramaCard,
    Login,
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
    getKdramas() {
      this.db.collection('kdramas').get()
        .then(querySnapshot => {
          const kdramas = [];
          querySnapshot.forEach(doc => kdramas.push({ id: doc.id, ...doc.data() }));
          this.addedKdramas = kdramas.map(kdrama => kdrama.wikiaId);
        })
        .catch(error => {
          console.error(error);
          this.setSnackbar({
            msg: "There was an error while getting the kdramas list.",
            color: "error",
            timeout: 10000
          });
        });
    }
  },
  created() {
    this.db = firebase.firestore();
    this.getKdramas();
  },
}
</script>
