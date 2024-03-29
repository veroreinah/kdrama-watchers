import Vue from "vue";
import Vuex from "vuex";
import router from "@/router";
import firebase from "firebase/app";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    pendingAction: null,
    snackbar: null,
    image: null,
  },
  mutations: {
    SET_USER_DATA(state, user) {
      state.user = user;
    },
    SET_PENDING_ACTION(state, pendingAction) {
      state.pendingAction = pendingAction;
    },
    SET_SNACKBAR(state, snackbar) {
      state.snackbar = snackbar;
    },
    SET_IMAGE(state, image) {
      state.image = image;
    },
  },
  actions: {
    login(context, userData) {
      return firebase
        .auth()
        .signInWithEmailAndPassword(userData.email, userData.password)
        .then(({ user }) => {
          this.dispatch("saveUser", user);
        });
    },

    saveUser({ commit }, user) {
      commit("SET_USER_DATA", user);
    },

    async logout({ commit }) {
      await firebase.auth().signOut();

      commit("SET_USER_DATA", null);
      router.push({ name: "Login" });
    },

    setPendingAction({ commit }, pendingAction) {
      commit("SET_PENDING_ACTION", pendingAction);
    },

    setSnackbar({ commit }, snackbar) {
      commit("SET_SNACKBAR", snackbar);
    },

    setImage({ commit }, image) {
      commit("SET_IMAGE", image);
    },
  },
});
