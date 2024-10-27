import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
// css
import 'uno.css';
import '@unocss/reset/normalize.css';
import '@/styles/basic.scss';

const app = createApp(App);

app.use(router);

app.mount('#app');
