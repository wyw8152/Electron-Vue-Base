import axios from 'axios';
import iview from 'iview';

const isDebug = true;

const zmallServer = axios.create({
  baseURL: 'http://10.5.72.8/',
});

const chatClient = axios.create({
  baseURL: 'http://10.5.72.7:8666/chat-client/',
});

const messageService = axios.create({
  baseURL: 'http://10.5.72.7:8667/chat-service/',
});

const baseServer = axios.create({
  baseURL: 'http://10.5.72.7:9090/plugins/restapi/v1/zmall/',
});

baseServer.interceptors.request.use(reqSuccess, resError);
chatClient.interceptors.request.use(reqSuccess, resError);
messageService.interceptors.request.use(reqSuccess, resError);
zmallServer.interceptors.request.use(reqSuccess, reqError);

baseServer.interceptors.response.use(resSuccess, reqError);
chatClient.interceptors.response.use(resSuccess, resError);
messageService.interceptors.response.use(resSuccess, resError);
zmallServer.interceptors.response.use(resSuccess, resError);

function reqSuccess(config) {
  config.headers = {
    'Content-Type': 'application/json',
    'authorization': 'Ooa6LJQfL1A2oeP2fuEiOHo4hw9t0dtx'
  }
  
  if (config.url.indexOf('message/receive/') > -1) {
    config.timeout = 15000
  } else {
    config.timeout = 5000
  }
  return config;
}

function reqError(error) {
  return Promise.reject(error);
}

function resSuccess(response) {
  return response
}

function resError(err) {
  if (err && err.response) {
  switch (err.response.status) {
      case 400:
      err.message = '请求错误'
      iview.Message.error(err.message);
      break

      case 401:
      err.message = '未授权，请登录'
      iview.Message.error(err.message);
      break

      case 403:
      err.message = '拒绝访问'
      iview.Message.error(err.message);
      break

      case 404:
      err.message = '请求地址出错'
      iview.Message.error(err.message);
      break

      case 408:
      err.message = '请求超时'
      iview.Message.error(err.message);
      break

      case 500:
      err.message = '服务器内部错误'
      iview.Message.error(err.message);
      break

      case 501:
      err.message = '服务未实现'
      iview.Message.error(err.message);
      break

      case 502:
      err.message = '网关错误'
      iview.Message.error(err.message);
      break

      case 503:
      err.message = '服务不可用'
      iview.Message.error(err.message);
      break

      case 504:
      err.message = '网关超时'
      iview.Message.error(err.message);
      break

      case 505:
      err.message = 'HTTP版本不受支持'
      iview.Message.error(err.message);
      break

      default:
    }
  }
  return Promise.reject(error);
}

export default {
  zmallServer,
  chatClient,
  messageService,
  baseServer
}