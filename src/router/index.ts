import { createRouter, createWebHashHistory } from "vue-router";

import Home from '../pages/Home.vue'
import Viewer from '../viewer/viewer.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/viewer',
        name: 'Viewer',
        title: '3D',
        component: Viewer
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
