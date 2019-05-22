<template>
  <div>
    <img id="logo" src="~@/assets/logo.png"/><img id="logo" src="~@/assets/logo.png"/>
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
        
      }
    },
    created() {
      
    },
    watch: {
      
    },
    computed: {
      
    },
    methods: {
      
    },
    mounted() {
      
    },
  }
</script>
<style lang="less">
</style>