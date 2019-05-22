<template>
  <div>
    <img id="logo" src="~@/assets/logo.png"/>
    <Button type="success" shape="circle" class="btn_login" @click="doLogin">托盘图标</Button>
  </div>
</template>

<script>
  const remote = require('electron').remote;
  const ipc = require('electron').ipcRenderer;
  const iview = require('iview');
  const storage = require('electron-localstorage');
  const fs = require('fs-extra');
  const path = require('path');
  import util from '../../utils/util';
  import settings from '../../utils/settings';
  import {docDir} from '../../utils/settings';
  export default {
    data() {
      return {
        isBlink: false
      }
    },
    created() {
      
    },
    watch: {
      
    },
    computed: {
      
    },
    methods: {
      doLogin: function() {
        if (!this.isBlink){
          ipc.send('startBlinkTrayIcon');
          this.isBlink = true;
        } else {
          ipc.send('stopBlinkTrayIcon');
          this.isBlink = false;
        }
      },
    },
    mounted() {
      
    },
  }
</script>
<style lang="less">
@import "../../assets/less/global.less";

.btn_login {
  width: 200px;
  background: #5FDD9A;
  border-color: #5FDD9A;
  margin-top: 25px;
}
</style>