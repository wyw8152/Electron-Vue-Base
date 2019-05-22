import Vue from 'vue';
import VueRouter from 'vue-router';
// import VueAxios from 'vue-axios';
import App from './App';
import routes from './route';
import store from './store';
// import filters from './utils/util';
// import db from './utils/db';
import logger from './utils/logger';
// import axios from 'axios';
import http from './utils/axios'

import iView from 'iview';
import 'iview/dist/styles/iview.css';
import './assets/less/common.less';
// 升级脚本
import './utils/upgrade';

Vue.use(VueRouter);

// Vue.use(VueAxios, axios);

Vue.prototype.http = http;

Vue.use(iView);

// Object.keys(filters).forEach(k => Vue.filter(k, filters[ k ]));

const router = new VueRouter({
  routes,
});

// axios.defaults.timeout = 5000;

// Vue.prototype.$db = db;

Vue.prototype.$logger = logger;

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});

// new Vue({
//   data: function(){
//     return {
//       userSessionID: ''
//     }
//   },
//   components: { App },
//   router,
//   store,
//   template: '<App/>'
// }).$mount('#app')