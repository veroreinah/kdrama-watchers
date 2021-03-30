<template>
  <v-card outlined tile>
    <div class="d-flex">
      <v-img
        :src="kdrama.image || mobileBg"
        :lazy-src="mobileBg"
        :height="small ? 100 : 200"
        :width="small ? 70 : 140"
        :max-width="small ? 70 : 140"
        gradient="to bottom, rgba(100,115,201,.1), rgba(25,32,72,.5)"
      />

      <div class="flex-grow-1 d-flex flex-column justify-space-between">
        <div>
          <v-card-title>{{ kdrama.title }}</v-card-title>
          <div v-if="kdrama.genre || kdrama.categories" class="pl-4 pr-3">
            <v-chip
              v-for="category in (kdrama.genre || kdrama.categories)"
              :key="category"
              color="primary"
              outlined
              small
              class="mr-1 mb-1"
            >{{ category }}</v-chip>
          </div>
        </div>

        <v-card-actions v-if="!hideActions && hasActions() && !toHide()">
          <v-spacer></v-spacer>

          <v-menu offset-y left tile>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                color="primary"
                small
                v-bind="attrs"
                v-on="on"
                :loading="loading"
                :disabled="loading"
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
                    @click="triggerAction(action.action, kdrama)"
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
</template>

<script>
import axios from 'axios';
import { mapActions, mapState } from "vuex";
import mobileBg from '@/assets/img/header-bg-mobile.jpg';
import firebase from "firebase/app";
import "firebase/firestore";

export default {
  name: 'KdramaCard',
  props: {
    kdrama: { type: Object, required: true },
    small: { type: Boolean, default: false },
    hideActions: { type: Boolean, default: false },
    hideIds: { type: Array },
  },
  data: () => ({
    db: undefined,
    loading: false,
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
      {
        action: 'abandoned',
        icon: 'mdi-heart-off',
        label: 'Abandoned',
      },
    ],
  }),
  computed: {
    ...mapState(["user", "pendingAction"]),
  },
  watch: {
    user(value) {
      if (value && this.pendingAction) {
        this.triggerAction(this.pendingAction.action, this.pendingAction.kdrama);
        this.setPendingAction(null);
      }
    },
  },
  methods: {
    ...mapActions(["setPendingAction", "setSnackbar"]),
    hasActions() {
      return this.kdrama.categories.some(category => category.toLowerCase() === 'kdrama');
    },
    toHide() {
      return this.hideIds && this.hideIds.length && this.hideIds.includes(this.kdrama.id);
    },
    async triggerAction(action, kdrama) {
      this.loading = true;

      if (!this.user) {
        this.setPendingAction({ action, kdrama });
        this.$router.push({ name: 'Home', query: { doLogin: true } });
      } else {
        const extraInfo = await this.getKramaInfo(kdrama.id, kdrama.title);
        let dateStart = null;
        let dateEnd = null;
        const now = new Date();

        if (action !== 'wishlist') {
          dateStart = now.toISOString().substr(0, 10);
        }
        if (action === 'already-watched' || action === 'abandoned') {
          dateEnd = now.toISOString().substr(0, 10);
        }

        const toSave = {
          ...kdrama,
          ...extraInfo,
          wikiaId: kdrama.id,
          user: this.user.uid,
          list: action,
          dateAdd: now.toJSON(),
          dateStart,
          dateEnd,
        };

        delete toSave.id;

        this.db.collection('kdramas').add(toSave)
          .then(() => {
            this.setSnackbar({
              msg: `Kdrama "${toSave.title}" successfully added to your ${action} list.`,
              color: "success",
              timeout: 5000
            });

            this.$emit('updateList');
          })
          .catch(error => {
            console.error(error);
            this.setSnackbar({
              msg: "There was an error while adding the kdrama.",
              color: "error",
              timeout: 10000
            });
          })
          .finally(() => this.loading = false);
      }
    },
    async getKramaInfo(id, title) {
      const kdramaInfo = await axios.get(`/api.php?action=query&prop=revisions&titles=${title}&rvslots=*&rvprop=content`);

      if (kdramaInfo.data, kdramaInfo.data && kdramaInfo.data.query && kdramaInfo.data.query.pages && kdramaInfo.data.query.pages[id]) {
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
          trivia = this.getTrivia(triviaMatch[1]);
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
              text: result.shift().text,
              children: result,
            }
          } else {
            return { text: t };
          }
        });
    },
  },
  created() {
    this.db = firebase.firestore();
  },
}
</script>
