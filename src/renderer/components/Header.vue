<style lang="less">
    @import "../assets/less/global.less";

    header {
        font-family: "Microsoft YaHei";
        font-size: 14px;
        overflow: hidden;
        /*background-color: @header-color;*/
        background: linear-gradient(90deg, @header-color, @bg-color);
        -webkit-app-region: drag;
        .left {
            float: left;
            margin-left: 8px;
        }
        .right {
            float: right;
            a {
                -webkit-app-region: no-drag;
                color: #000;
                margin-right: 10px;
            }
        }
    }
</style>

<template>
    <header>
        <section class="left">
            客服平台 - 恣在家
        </section>
        <section class="right">
            <a href="javascript:void(0)" @click="minWindows">
                <Icon size="16" type="md-remove"></Icon>
            </a>
            <a href="javascript:void(0)" @click="maxWindows">
                <Icon v-if="!isMaxWindow" size="12" type="md-browsers"></Icon>
                <Icon v-if="isMaxWindow" size="12" type="md-contract"></Icon>
            </a>
            <a href="javascript:void(0)" @click="closeWindows">
                <Icon size="16" type="md-close"></Icon>
            </a>
        </section>
    </header>
</template>
<script>
import packageJson from '../../../package.json';
const ipcRenderer = require('electron').ipcRenderer;

export default {
  data() {
    return {
      isMaxWindow: false
    };
  },
  methods: {
    minWindows() {
      ipcRenderer.send('min-window');
    },
    maxWindows() {
      let reply = ipcRenderer.sendSync('max-window');
      console.log(reply)
      if (reply === 'false') {
        this.isMaxWindow = false;
      } else {
        this.isMaxWindow = true;
      }
    },
    closeWindows() {
      ipcRenderer.send('close-window');
    },
  },
  created() {
    
  },
};
</script>
