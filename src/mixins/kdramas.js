import { mapActions } from "vuex";
import axios from "axios";
import firebase from "firebase/app";
import "firebase/firestore";

export const kdramas = {
  data: () => ({
    db: undefined,
  }),
  methods: {
    ...mapActions(["setSnackbar"]),

    getKdramas(user, list) {
      return new Promise((resolve, reject) => {
        let kdramasCollection;
        if (list) {
          kdramasCollection = this.db
            .collection("kdramas")
            .where("user", "==", user.uid)
            .where("list", list[0], list[1]);
        } else {
          kdramasCollection = this.db
            .collection("kdramas")
            .where("user", "==", user.uid);
        }

        kdramasCollection
          .get()
          .then((querySnapshot) => {
            const kdramas = [];
            querySnapshot.forEach((doc) =>
              kdramas.push({ id: doc.id, ...doc.data() })
            );
            this.addedKdramas = kdramas;

            resolve(kdramas);
          })
          .catch((error) => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al recuperar el listado de kdramas.",
              color: "error",
              timeout: 10000,
            });

            reject();
          });
      });
    },

    addKdrama(kdrama) {
      return new Promise((resolve, reject) => {
        this.db
          .collection("kdramas")
          .add(kdrama)
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${
                kdrama.title
              }" añadido correctamente a la lista ${this.getListProp(
                kdrama.list,
                "label"
              )}.`,
              color: "success",
              timeout: 5000,
            });

            resolve();
          })
          .catch((error) => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al añadir el kdrama.",
              color: "error",
              timeout: 10000,
            });

            reject();
          });
      });
    },

    updateKdrama(kdrama) {
      return new Promise((resolve, reject) => {
        this.db
          .collection("kdramas")
          .doc(kdrama.id)
          .set(kdrama)
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${kdrama.title}" actualizado correctamente.`,
              color: "success",
              timeout: 5000,
            });

            resolve();
          })
          .catch((error) => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al actualizar el kdrama.",
              color: "error",
              timeout: 10000,
            });

            reject();
          });
      });
    },

    deleteKdrama(kdrama) {
      return new Promise((resolve, reject) => {
        this.db
          .collection("kdramas")
          .doc(kdrama.id)
          .delete()
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${this.kdrama.title}" eliminado.`,
              color: "success",
              timeout: 5000,
            });

            resolve();
          })
          .catch((error) => {
            console.error(error);
            this.setSnackbar({
              msg: "Ha habido un error al eliminar el kdrama.",
              color: "error",
              timeout: 10000,
            });

            reject();
          });
      });
    },

    searchKdrama(query) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api.php?action=query&list=search&srsearch=${query}`)
          .then(async (result) => {
            if (result.data && result.data.query.search.length) {
              const data = [];

              for (let i = 0; i < result.data.query.search.length; i++) {
                const item = result.data.query.search[i];
                const pageInfo = await axios.get(
                  `/api.php?action=query&prop=revisions&titles=${encodeURIComponent(
                    item.title
                  )}&rvslots=*&rvprop=content`
                );

                if (
                  pageInfo.data &&
                  pageInfo.data.query &&
                  pageInfo.data.query.pages &&
                  pageInfo.data.query.pages[item.pageid]
                ) {
                  const pageRevisions =
                    pageInfo.data.query.pages[item.pageid].revisions;
                  const lastRevision =
                    pageRevisions[pageRevisions.length - 1].slots.main["*"];
                  const kdramaContent = lastRevision.split(/==Temporada\s/);

                  if (kdramaContent.length > 1) {
                    kdramaContent.forEach((content) => {
                      let season = content.match(/^(\d)==/);

                      if (season && season.length === 2) {
                        data.push({
                          id: `${item.pageid}-${season[1]}`,
                          originalId: item.pageid,
                          title: `${item.title} (${season[1]})`,
                          originalTitle: item.title,
                          seasons: kdramaContent.length - 1,
                          season: season[1],
                          imageName: this.getImageName(content),
                        });
                      }
                    });
                  } else {
                    data.push({
                      id: item.pageid,
                      title: item.title,
                      originalTitle: item.title,
                      imageName: this.getImageName(lastRevision),
                    });
                  }
                }
              }

              const categoriesInfo = await axios.get(
                `/api.php?action=query&prop=categories&titles=${data
                  .map((d) => encodeURIComponent(d.originalTitle))
                  .join("|")}&cllimit=500`
              );

              if (categoriesInfo.data && categoriesInfo.data.query.pages) {
                data.forEach((item) => {
                  const id =
                    typeof item.id === "string"
                      ? item.id.split("-")[0]
                      : item.id;
                  if (
                    categoriesInfo.data.query.pages[id] &&
                    categoriesInfo.data.query.pages[id].categories
                  ) {
                    item["categories"] = categoriesInfo.data.query.pages[
                      id
                    ].categories.map((cat) =>
                      cat.title.replace("Categoría:", "")
                    );
                  }
                });
              }

              const kdramasData = data.filter(
                (kdrama) =>
                  kdrama.categories &&
                  kdrama.categories.some(
                    (category) => category.toLowerCase() === "kdrama"
                  )
              );

              for (let index = 0; index < kdramasData.length; index++) {
                const kdrama = kdramasData[index];

                if (kdrama.imageName) {
                  const imagesInfo = await axios.get(
                    `/api.php?action=query&prop=imageinfo&titles=${encodeURIComponent(
                      kdrama.imageName
                    )}&iiprop=url`
                  );

                  if (imagesInfo.data && imagesInfo.data.query.pages) {
                    const image = Object.values(
                      imagesInfo.data.query.pages
                    ).shift();

                    if (image && image.imageinfo && image.imageinfo.length) {
                      kdrama["image"] = image.imageinfo[0].url.replace(
                        "https://static",
                        "https://vignette"
                      );
                    }
                  }
                }
              }

              resolve(kdramasData);
            } else {
              resolve([]);
            }
          })
          .catch((error) => {
            console.error(error);

            reject();
          });
      });
    },

    getImageName(content) {
      let imageName = content.match(/(Archivo:.*?)\|/);
      if (!imageName || imageName.length < 2) {
        imageName = content.match(/(Imagen:.*?)\|/);
      }

      return imageName && imageName.length > 1 && imageName[1];
    },

    async getKdramaInfo(id, title, season) {
      const kdramaInfo = await axios.get(
        `/api.php?action=query&prop=revisions&titles=${encodeURIComponent(
          title
        )}&rvslots=*&rvprop=content`
      );

      if (
        kdramaInfo.data &&
        kdramaInfo.data.query &&
        kdramaInfo.data.query.pages &&
        kdramaInfo.data.query.pages[id]
      ) {
        const kdramaRevisions = kdramaInfo.data.query.pages[id].revisions;
        let lastRevision =
          kdramaRevisions[kdramaRevisions.length - 1].slots.main["*"];

        if (season) {
          const kdramaContent = lastRevision.split(/==Temporada\s/);

          if (kdramaContent.length > 1) {
            kdramaContent.forEach((content) => {
              let _season = content.match(/^(\d)==/);

              if (_season && _season.length === 2 && _season[1] === season) {
                lastRevision = kdramaContent[0] + content;
              }
            });
          }
        }

        let genre = null;
        let genreMatch = lastRevision.match(/(?:Género|Genero).*?\s(.*)\n/m);
        if (genreMatch && genreMatch.length === 2) {
          genre = genreMatch[1].split(/,/).map((g) => g.trim());
        }

        let episodes = null;
        let episodesMatch = lastRevision.match(
          /Episodios.*?\s?:?(?:''')?(.*)\n/m
        );
        if (episodesMatch && episodesMatch.length === 2) {
          episodes = episodesMatch[1];
        }

        let broadcastDate = null;
        let broadcastDateMatch = lastRevision.match(
          /Periodo de emisión.*?\s(?:''')?(.*)\n/m
        );
        if (broadcastDateMatch && broadcastDateMatch.length === 2) {
          broadcastDate = broadcastDateMatch[1];
        }

        let synopsis = null;
        let synopsisMatch = lastRevision.match(
          /Sinopsis\s*?={2,3}\n(.*?)\n={2,3}/s
        );
        if (synopsisMatch && synopsisMatch.length === 2) {
          synopsis =
            "<p>" +
            synopsisMatch[1]
              .replace(/\n\s*\n/g, "\n")
              .replace(/(?:\r\n|\r|\n)+$/, "")
              .replace(/(?:\r\n|\r|\n)/g, "</p><p>") +
            "</p>";
        }

        let trivia = null;
        let triviaMatch = lastRevision.match(
          /Curiosidades\s*?={2,3}\n(.*?)(\n={2,3}|$)/s
        );
        if (triviaMatch && triviaMatch.length === 3) {
          trivia = this.getTrivia(triviaMatch[1].replace(/\*([^*])/g, "* $1"));
        }

        let broadcasting = !!lastRevision.match(/\{\{En emisión}}/s);
        let comingSoon = !!lastRevision.match(/\{\{Próximos Dramas}}/s);

        return {
          genre,
          episodes,
          broadcastDate,
          synopsis,
          trivia,
          broadcasting,
          comingSoon,
        };
      }

      return {};
    },

    getTrivia(text, rep = 1) {
      const regExp = new RegExp(`(?:\\s|^)\\*{${rep}}(?:\\b|\\s)`);
      return text
        .split(regExp)
        .map((t) => t.trim())
        .filter((t) => t)
        .map((t) => {
          const regExp2 = new RegExp(`(?:\\s|^)\\*{${rep + 1}}(?:\\b|\\s)`);
          if (regExp2.exec(t)) {
            const result = this.getTrivia(t, rep + 1);
            return {
              text: result.shift().text.trim(),
              children: result,
            };
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
