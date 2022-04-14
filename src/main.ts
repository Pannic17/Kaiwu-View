import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import VConsole from 'vconsole'

const vConsole = new VConsole();

createApp(App).use(vConsole).use(router).mount('#app')
