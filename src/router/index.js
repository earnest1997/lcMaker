import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/index/home/index'
import Form from '@/views/index/form/index'
import Custom from '@/views/index/custom/index'

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
    component: () => import(Custom)
  },
  {
    path: '/form',
    name: 'form',
    component: () => import(Form)
  }
]

const router = new VueRouter({
  routes
})

export default router
