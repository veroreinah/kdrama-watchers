import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'
import "firebase/auth";
import "firebase/firestore";
import vuetify from './plugins/vuetify';
import axios from 'axios';

Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: "AIzaSyBAKjOAXWCdT9wSH_-Zx4mW0rWK7QguRgM",
  projectId: "kdrama-watchers",
};
firebase.initializeApp(firebaseConfig);

axios.interceptors.request.use(config => {
  if (!config.url.includes('http://') && !config.url.includes('https://')) {
    config.url = `https://drama.fandom.com/es${config.url}&format=json&origin=*`;
  }

  return config;
}, error => Promise.reject(error));

let app;

firebase.auth().onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      render: h => h(App)
    }).$mount('#app');
  }
});