import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/:list',
    name: 'Kdramas list',
    component: () => import(/* webpackChunkName: "list" */ '../views/KdramasList.vue'),
    props: true,
    meta: {
      availableLists: [ 
        'wishlist',
        'currenty-watching',
        'already-watched',
        'abandoned',
      ],
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.availableLists && to.meta.availableLists.length) {
    if (to.params.list && to.meta.availableLists.includes(to.params.list)) {
      next();
    } else {
      next({ name: 'Home' });
    }
  } else {
    next();
  }
});

export default router
