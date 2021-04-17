import { mapActions } from 'vuex';
import axios from 'axios';
import firebase from "firebase/app";
import "firebase/firestore";

export const kdramas = {
  data: () => ({
    db: undefined,
  }),
  methods: {
    ...mapActions(["setSnackbar"]),

    getKdramas(user, list, orderBy) {
      return new Promise((resolve, reject) => {
        let kdramasCollection;
        if (list) {
          if (orderBy) {
            kdramasCollection = this.db.collection('kdramas')
              .where("user", "==", user.uid)
              .where("list", list[0], list[1])
              .orderBy(this.getListProp(orderBy[0], 'sortField'), orderBy[1])
          } else {
            kdramasCollection = this.db.collection('kdramas')
              .where("user", "==", user.uid)
              .where("list", list[0], list[1]);
          }
        } else {
          if (orderBy) {
            kdramasCollection = this.db.collection('kdramas')
              .where("user", "==", user.uid)
              .orderBy(this.getListProp(orderBy[0], 'sortField'), orderBy[1])
          } else {
            kdramasCollection = this.db.collection('kdramas')
              .where("user", "==", user.uid);
          }
        }
        
        kdramasCollection.get()
          .then(querySnapshot => {
            const kdramas = [];
            querySnapshot.forEach(doc => kdramas.push({ id: doc.id, ...doc.data() }));
            this.addedKdramas = kdramas;

            resolve(kdramas);
          })
          .catch(error => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al recuperar el listado de kdramas.",
              color: "error",
              timeout: 10000
            });

            reject();
          });
        });
    },

    addKdrama(kdrama) {
      return new Promise((resolve, reject) => {
        this.db.collection('kdramas').add(kdrama)
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${kdrama.title}" añadido correctamente a la lista ${this.getListProp(kdrama.list, 'label')}.`,
              color: "success",
              timeout: 5000
            });

            resolve();
          })
          .catch(error => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al añadir el kdrama.",
              color: "error",
              timeout: 10000
            });

            reject();
          });
      });
    },

    updateKdrama(kdrama) {
      return new Promise((resolve, reject) => {
        this.db.collection('kdramas').doc(kdrama.id).set(kdrama)
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${kdrama.title}" actualizado correctamente.`,
              color: "success",
              timeout: 5000
            });

            resolve();
          })
          .catch(error => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al actualizar el kdrama.",
              color: "error",
              timeout: 10000
            });

            reject();
          });
      });
    },

    deleteKdrama(kdrama) {
      return new Promise((resolve, reject) => {
        this.db.collection('kdramas').doc(kdrama.id).delete()
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${this.kdrama.title}" eliminado.`,
              color: "success",
              timeout: 5000
            });
            
            resolve();
          })
          .catch(error => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al eliminar el kdrama.",
              color: "error",
              timeout: 10000
            });

            reject();
          });
      });
    },

    searchKdrama(query) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api.php?action=query&list=search&srsearch=${query}`)
          .then(async result => {
            if (result.data && result.data.query.search.length) {
              const imagesName = [];
              const imagesPerPage = {};
              const noImages = [];

              const data = result.data.query.search.map(item => {
                let imageName = item.snippet.match(/(Archivo:.*)\|thumb/);
                if (!imageName || imageName.length < 2) {
                  imageName = item.snippet.match(/(Imagen:.*)\|thumb/);
                }

                if (imageName && imageName.length >= 2) {
                  imagesName.push(imageName[1]);
                  imagesPerPage[item.pageid] = imageName[1];
                }

                if (!imageName) {
                  noImages.push({ id: item.pageid, title: item.title });
                }

                return {
                  id: item.pageid,
                  title: item.title,
                };
              });

              for (const page of noImages) {
                const pageInfo = await axios.get(`/api.php?action=query&prop=revisions&titles=${page.title}&rvslots=*&rvprop=content`);
                      
                if (pageInfo.data && pageInfo.data.query && pageInfo.data.query.pages && pageInfo.data.query.pages[page.id]) {
                  const pageRevisions = pageInfo.data.query.pages[page.id].revisions;
                  const lastRevision = pageRevisions[pageRevisions.length - 1].slots.main['*'];
                  
                  let imageName = lastRevision.match(/(Archivo:.*)\|thumb/);
                  if (!imageName || imageName.length < 2) {
                    imageName = lastRevision.match(/(Imagen:.*)\|thumb/);
                  }

                  if (imageName && imageName.length >= 2) {
                    imagesName.push(imageName[1]);
                    imagesPerPage[page.id] = imageName[1];
                  }
                }
              }

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

              resolve(data);
            } else {
              resolve([]);
            }
          })
          .catch(error => {
            console.error(error);

            reject();
          });
      });
    },

    async getKramaInfo(id, title) {
      const kdramaInfo = await axios.get(`/api.php?action=query&prop=revisions&titles=${title}&rvslots=*&rvprop=content`);

      if (kdramaInfo.data && kdramaInfo.data.query && kdramaInfo.data.query.pages && kdramaInfo.data.query.pages[id]) {
        const kdramaRevisions = kdramaInfo.data.query.pages[id].revisions;
        const lastRevision = kdramaRevisions[kdramaRevisions.length - 1].slots.main['*'];

        let genre = null;
        let genreMatch = lastRevision.match(/(?:Género|Genero).*?\s(.*)\n/m);
        if (genreMatch && genreMatch.length === 2) {
          genre = genreMatch[1].split(/,/).map(g => g.trim());
        }
        
        let episodes = null;
        let episodesMatch = lastRevision.match(/Episodios.*?\s(?:''')?(.*)\n/m);
        if (episodesMatch && episodesMatch.length === 2) {
          episodes = episodesMatch[1];
        }
        
        let synopsis = null;
        let synopsisMatch = lastRevision.match(/Sinopsis\s*?==\n(.*?)\n==/s);
        if (synopsisMatch && synopsisMatch.length === 2) {
          synopsis = '<p>' + synopsisMatch[1]
            .replace(/\n\s*\n/g, '\n')
            .replace(/(?:\r\n|\r|\n)+$/, '')
            .replace(/(?:\r\n|\r|\n)/g, '</p><p>') + '</p>';
        }
        
        let trivia = null;
        let triviaMatch = lastRevision.match(/Curiosidades\s*?==\n(.*?)\n==/s);
        if (triviaMatch && triviaMatch.length === 2) {
          trivia = this.getTrivia(triviaMatch[1].replace(/\*([^*])/g, '* $1'));
        }

        return { genre, episodes, synopsis, trivia };
      }

      return {};
    },

    getTrivia(text, rep = 1) {
      const regExp = new RegExp(`(?:\\s|^)\\*{${rep}}(?:\\b|\\s)`);
      return text
        .split(regExp)
        .map(t => t.trim())
        .filter(t => t)
        .map(t => {
          const regExp2 = new RegExp(`(?:\\s|^)\\*{${rep + 1}}(?:\\b|\\s)`);
          if (regExp2.exec(t)) {
            const result = this.getTrivia(t, rep + 1);
            return {
              text: result.shift().text.trim(),
              children: result,
            }
          } else {
            return { text: t.trim() };
          }
        });
    },
  },
  created() {
    this.db = firebase.firestore();
  },
};
