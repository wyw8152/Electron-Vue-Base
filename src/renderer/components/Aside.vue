<style lang="less">
    @import "../assets/less/global.less";

    aside {
        position: relative;
        background-color: @aside-color;
        box-shadow: 0 0 7px #000;
        .layout-menu-left {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 40px;
        }
        .aside-drop-menu {
            position: absolute;
            height: 40px;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            .ivu-dropdown {
                .ivu-dropdown-rel {
                    cursor: pointer;
                    margin-top: 10px;
                }
            }
        }
    }

    .aboutText {
        p {
            line-height: 26px;
        }
    }

    .psText {
        margin-top: 20px;
    }

</style>

<template>
    <aside>
        <Menu ref="menu" @on-select="selectMenu"
              theme="dark" width="100%" :active-name="activeMenuName" accordion class="layout-menu-left">
            <Menu-item v-for="(menu, index) in MENU" :name="menu.path" :key="index">
                <Tooltip :content="menu.title" placement="right" :delay="800">
                    <Icon :type="menu.icon" :size="24"></Icon>
                </Tooltip>
            </Menu-item>
        </Menu>
        <div class="aside-drop-menu">
            <Dropdown trigger="click" placement="top-start" @on-click="dropMenuClick">
                <Icon type="ios-menu" :size="24" color="white"></Icon>
                <DropdownMenu slot="list">
                    <!--<DropdownItem name="update">
                        <Icon type="ios-cloud-download-outline" :size="14"></Icon>
                        检查更新
                    </DropdownItem>-->
                    <DropdownItem name="setting">设置</DropdownItem>
                    <DropdownItem name='login'>登录</DropdownItem>
                    <DropdownItem name="about">关于</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
        <Modal
                v-model="modalShow"
                title="关于">
            <div class="aboutText">
                <p><strong>客服平台- 恣在家 {{version}}</strong></p>
            </div>
            <div class="psText">
                <p>PS：数据与配置文件存放在<a href="javascript:void(0)"
                              @click="openPath(docDir)">{{docDir}}</a>下。若有重装系统等操作，请记得统一备份，并在重装后放至相同目录</p>
            </div>
            <div slot="footer">
                <Button @click="modalShow = false">
                    关闭
                </Button>
            </div>
        </Modal>
    </aside>
</template>

<script>
const ipc = require('electron').ipcRenderer;
import MENU from '../menu';
import packageJson from '../../../package.json';
import { docDir } from '../utils/settings';

export default {
  data() {
    return {
      MENU,
      activeMenuName: '',
      modalShow: false,
      version: packageJson.version,
      docDir,
    };
  },
  methods: {
    selectMenu(path) {
      this.$router.push({ path });
    },
    dropMenuClick(name) {
      switch (name) {
        case 'update':
          console.log('check update');
          break;
        case 'about':
          this.modalShow = true;
          break;
        case 'setting':
          console.log('check setting');
          break;
        case 'login':
          this.openLogin();
          break;
        default:
          null;
      }
    },

    openLogin() {
      // ipc.send('openLoginPage');
    },

    openUrl(url) {
      this.$electron.shell.openExternal(url);
    },
    openPath(path) {
      this.$electron.shell.openItem(path);
    },
  },
  watch: {
    $route() {
      this.activeMenuName = this.$route.path;
      console.log('route:' + this.activeMenuName)
      this.$nextTick(() => {
        this.$refs.menu.updateActiveName();
      });
    },
  },
  created() {
    this.activeMenuName = this.$route.path;
    console.log('created:' + this.activeMenuName)
    this.$nextTick(() => {
      this.$refs.menu.updateActiveName();
    });
  },
};
</script>
