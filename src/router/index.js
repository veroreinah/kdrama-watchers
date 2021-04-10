import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import firebase from "firebase/app";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/lists',
    name: 'Lists',
    component: {
      render: c => c('router-view'),
    },
    redirect: '/lists/wishlist',
    children: [
      {
        path: ':list',
        name: 'Kdramas list',
        component: () => import(/* webpackChunkName: "list" */ '../views/KdramasList.vue'),
        props: true,
        meta: {
          availableLists: [ 
            'wishlist',
            'currently-watching',
            'already-watched',
            'abandoned',
          ],
          requiresAuth: true,
          title: {
            'wishlist': 'Lista de deseos',
            'currently-watching': 'Viendo',
            'already-watched': 'Vistos',
            'abandoned': 'Abandonados',
          }
        },
      },
    ],
  },
  {
    path: '/calendar',
    name: 'Kdramas calendar',
    component: () => import(/* webpackChunkName: "calendar" */ '../views/KdramasCalendar.vue'),
    meta: {
      requiresAuth: true,
      title: 'Calendario',
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

const updateTitle = to => {
  let windowTitle = 'Kdrama watchers';
  if (to.meta && to.meta.title) {
    if (typeof to.meta.title === 'string') {
      windowTitle += ` - ${to.meta.title}`;
    } else if (to.params.list && to.meta.title[to.params.list]) {
      windowTitle += ` - ${to.meta.title[to.params.list]}`;
    }
  }
  window.document.title = windowTitle;
}

router.beforeEach((to, from, next) => {
  updateTitle(to);

  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);

  if (requiresAuth && !firebase.auth().currentUser) {
    localStorage.setItem('redirectAfterLogin', to.fullPath);
    next({ name: 'Home', query: { doLogin: true } });
  } else if (to.meta.availableLists && to.meta.availableLists.length) {
    if (to.params.list && to.meta.availableLists.includes(to.params.list)) {
      next();
    } else {
      next({ name: 'Home' });
    }
  } else if (!to.matched || !to.matched.length) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router
