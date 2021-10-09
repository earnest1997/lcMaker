import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/index/home/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/parser',
    name: 'parser',
    component: () => import(/* webpackChunkName: "parser-example" */'@/components/parser/example/Index.vue')
  },
  {
    path: '/tinymce',
    name: 'tinymce',
    component: () => import(/* webpackChunkName: "tinymce-example" */'@/components/tinymce/example/Index.vue')
  },
  {
    path: '/custom',
    name: 'custom',
    component: () => import(/* webpackChunkName: "custom-example" */'@/views/index/custom/index')
  },
  {
    path: '/form',
    name: 'form',
    component: () => import(/* webpackChunkName: "form-example" */'@/views/index/form/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
