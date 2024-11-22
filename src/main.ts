import {createApp} from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
// css
import 'uno.css';
import '@unocss/reset/normalize.css';
import '@/styles/basic.scss';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);

app.mount('#app');
