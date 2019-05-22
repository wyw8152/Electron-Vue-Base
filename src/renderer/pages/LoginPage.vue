<template>
  <div>
    <header class="header">
        <section class="left">
            客服平台 - 恣在家
        </section>
        <section class="right">
          <a href="javascript:void(0)" @click="closeLoginWindow">
              <Icon size="14" type="md-close"></Icon>
          </a>
      </section>
    </header>
    <div class="login_view">
      <div class="login_area">
        <img id="logo" src="~@/assets/logo.png"/>
        <Form style="margin-top: 50px">
          <FormItem>
            <i-input style="width: 203px" clearable placeholder="帐号" type="text" v-model="username">
              <Icon type="ios-contact" slot="prepend" size="18"/>
            </i-input>
          </FormItem>
          <FormItem>
            <i-input style="width: 203px" clearable placeholder="密码" type="password" v-model="password">
              <Icon type="ios-lock" slot="prepend" size="18"/>
            </i-input>
          </FormItem>
        </Form>
        <Row type="flex" justify="space-around">
          <Checkbox v-model="isRememberPwd" style="width:80px; margin-left:25px;" @on-change="onChangeR">记住密码</Checkbox>
          <Checkbox v-model="isAutomaticLogin" style="width:80px; margin-left:50px;" @on-change="onChangeA">自动登录</Checkbox>
        </Row>
        <Button type="success" shape="circle" class="btn_login" @click="doLogin">登   录</Button>
        <!-- <Button type="success" shape="circle" class="btn_login" @click="test">测   试</Button> -->
      </div>
    </div>
  </div>
</template>

<script>
  const remote = require('electron').remote;
  const ipc = require('electron').ipcRenderer;
  const iview = require('iview');
  const storage = require('electron-localstorage');
  const fs = require('fs-extra');
  const path = require('path');
  import util from '../utils/util';
  import settings from '../utils/settings';
  import {docDir} from '../utils/settings';
  const SqliteDB = require('../utils/sqlite').SqliteDB;

  export default {
    name: 'loginPage',
    data() {
      return {
        username: '',
        password: '',
        isRememberPwd: false,
        isAutomaticLogin: false
      }
    },
    created() {
      let lastLoginUserName = settings.get('LastLoginUserName');
      if (lastLoginUserName == undefined) {
        settings.set('LastLoginUserName', '')
        settings.set('LastLoginUserPwd', '')
        lastLoginUserName = ''
      }
      this.username = lastLoginUserName;
      console.log('保存的username:' + this.username);
      if (this.username == '') return;

      this.password = util.aesDecrypt(settings.get('LastLoginUserPwd'));
      
      let personalSettingPath = path.join(docDir,  this.username + '.json');
      if (fs.existsSync(personalSettingPath)) {
        storage.setStoragePath(personalSettingPath);
        this.isRememberPwd = storage.getItem('IsRememberPwd') === 'true';
        this.isAutomaticLogin = storage.getItem('IsAutomaticLogin') === 'true';
        remote.getGlobal('loginSession').isRememberPwd = this.isRememberPwd;
        remote.getGlobal('loginSession').isAutomaticLogin = this.isAutomaticLogin;
      }
    },
    methods: {
      closeLoginWindow() {
        ipc.send('closeLoginWindow')
      },
      onChangeR(value) {
        this.isRememberPwd = value;
        if (!this.isRememberPwd && this.isAutomaticLogin) {
          this.isAutomaticLogin = false;
        }
      },
      onChangeA(value) {
        this.isAutomaticLogin = value;
        if (this.isAutomaticLogin && !this.isRememberPwd) {
          this.isRememberPwd = true;
        }
      },
      doLogin() {
        if (this.username == '') {
          this.$Message.error('请输入客服帐号');
          return;
        }
        if (this.password == '') {
          this.$Message.error('请输入客服密码');
          return;
        }
        // let globalInfo = this.GLOBAL;
        // let _url = globalInfo.messageServiceUrl + 'login'
        // console.log(remote.getGlobal('messageServiceUrl'))
        var _this = this;
        let _url = 'login'; //remote.getGlobal('messageServiceUrl') + 
        let _data = {username: this.username, password: this.password, src: 'PC', version: settings.get('version')}
        this.http.messageService({
          method: "POST",
          url: _url,
          data: _data
          
        // this.axios({
        //   method: "POST",
        //   url: _url,
        //   data: _data
        }).then((res) => {
          if (res.status == 200 && res.data != '') {
            if (res.data.code == 'S') {
              remote.getGlobal('loginSession').userSessionID = res.data.data.userSessionId;
              // console.log(storage.getItem('userSessionID'));
              // console.log('index.js:' + remote.getGlobal('loginSession').userSessionID);
              _this.$root.userSessionID = res.data.data.userSessionId;
              // console.log('main.js:' + _this.$root.userSessionID);
              settings.set('LastLoginUserName', _this.username);
              settings.set('LastLoginUserPwd', _this.isRememberPwd ? util.aesEncrypt(_this.password) : '');
              
              let personalSettingPath = path.join(docDir,  _this.username + '.json');
              fs.ensureFileSync(personalSettingPath);
              storage.setStoragePath(personalSettingPath);
              if (_this.isAutomaticLogin != remote.getGlobal('loginSession').isAutomaticLogin) {
                storage.setItem('IsAutomaticLogin', _this.isAutomaticLogin ? 'true' : 'false');
              }
              if (_this.isRememberPwd != remote.getGlobal('loginSession').isRememberPwd) {
                storage.setItem('IsRememberPwd', _this.isRememberPwd ? 'true' : 'false');
              }
              
              remote.getGlobal('userConfigs').HotKeyOpenClient = storage.getItem('HotKeyOpenClient')
              remote.getGlobal('userConfigs').HotKeyOpenPhrase = storage.getItem('HotKeyOpenPhrase')
              remote.getGlobal('userConfigs').HotKeyPrintScreen = storage.getItem('HotKeyPrintScreen')

              iview.Message.success('登录成功，开始加载数据');
              const msg = iview.Message.loading({
                    content: '正在加载数据...',
                    duration: 0
                });
              _this.processBaseData();
              setTimeout(msg, 1000);
              ipc.send('loginedTransaction', res.data.data.history);
              // setTimeout(() => {
              // }, 2000);
            } else {
              iview.Message.error('客服登录失败');
            }
          }
        }).catch((error) => {
          console.log(error);
        });
      },
      async processBaseData() {
        let systemInfos = await this.loadSystemInfo();
        remote.getGlobal('sharedInfo').customerAvatar = systemInfos.defaultAvatar.customerDefaultAvatar;
        remote.getGlobal('sharedInfo').serviceAvatar = systemInfos.defaultAvatar.serviceDefaultAvatar;
        systemInfos.userConfigInfo.forEach(userConfig => {
          if (userConfig.configName == 'OpenReminderSound') {
            remote.getGlobal('userConfigs').OpenReminderSound = userConfig.configValue === 'true' ? true : false;
          } else {
            remote.getGlobal('userConfigs')[userConfig.configName] = userConfig.configValue;
          }
        });
        remote.getGlobal('sharedInfo').tagList = systemInfos.tag;
        remote.getGlobal('loginSession').userName = this.username;
        remote.getGlobal('loginSession').nickName = systemInfos.userInfo.nickname;
        remote.getGlobal('loginSession').sex = systemInfos.userInfo.sex;
        remote.getGlobal('loginSession').mobile = systemInfos.userInfo.mobile;
        remote.getGlobal('loginSession').weixin = systemInfos.userInfo.weixin;
        remote.getGlobal('loginSession').headImg = systemInfos.userInfo.headImg == null || systemInfos.userInfo.headImg == '' 
          ? systemInfos.defaultAvatar.serviceDefaultAvatar
          : systemInfos.userInfo.headImg;
        remote.getGlobal('sharedInfo').workLogTags = systemInfos.logTag;
        remote.getGlobal('sharedInfo').customerLogEditableTime = systemInfos.customerLogEditableTime;

        let emojis = await this.getEmojiInfo();
        if (emojis['zmall.chat.emoji'] != undefined) {
          remote.getGlobal('sharedInfo').emojis = JSON.parse(emojis['zmall.chat.emoji']).default;
        }
        // console.log(remote.getGlobal('loginSession'));
        // console.log(remote.getGlobal('userConfigs'));
        // console.log(remote.getGlobal('sharedInfo'));
        
        // let dbPath = path.join(docDir,  _this.username + '.db');
        // var sqliteDB = new SqliteDB(dbPath);
        // var createTableSql = "create table if not exists TopSession(CustomerID TEXT);";
        // sqliteDB.createTable(createTableSql);
        // var datas = ['wxayftgx_1107095522','zuyo07x0_110101011']
        // var insertSql = "insert into TopSession(CustomerID) values(?)";
        // sqliteDB.insertData(insertSql, datas);
        // var querySql = 'select * from TopSession';
        // sqliteDB.queryData(querySql, objects => {
        //   for(var i = 0; i < objects.length; ++i){
        //     console.log(objects[i])
        //   }
        // });
        // var delSql = "delete from TopSession where CustomerID='wxayftgx_1107095522'";
        // sqliteDB.executeSql(delSql);
        // var querySql = 'select * from TopSession';
        // sqliteDB.queryData(querySql, objects => {
        //   for(var i = 0; i < objects.length; ++i){
        //     console.log(objects[i])
        //   }
        // });
        
      },
      loadSystemInfo() {
        return new Promise((resolve, reject) => {
          let _url = 'customer/loadSystemInfo/' + this.username;
          this.http.baseServer({
            method: "GET",
            url: _url,
          })
          .then((res) => {
            let result = ''
            if (res.status == 200 && res.data != '') {
                result = res.data
            }
            resolve(result)
          }).catch((err) => {
            reject(err)
          })
        })
      },
      getEmojiInfo() {
        return new Promise((resolve, reject) => {
          let _url = 'customer/getProperty/zmall.chat.emoji';
          this.http.baseServer({
            method: "GET",
            url: _url,
          }).then((res) => {
            let result = ''
            if (res.status == 200 && res.data != '') {
                result = res.data
            }
            resolve(result)
          }).catch((err) => {
            reject(err)
          })
        })
      },
      test() {
        // console.log(remote.getGlobal('messageServiceUrl'))
        // remote.getGlobal('loginSession').userSessionID = '1234567890';
        // ipc.send('loginedTransaction', '')
        console.log(storage.getStoragePath());
        let filepath = path.join(docDir, this.username + '.json');
        fs.ensureFileSync(filepath);
        storage.setStoragePath(filepath);
        console.log(storage.getStoragePath());
        storage.setItem('IsAutomaticLogin', true);
        storage.setItem('IsRememberPwd', true);
        storage.setItem('HotKeyOpenClient', 'Ctrl+F2');
        storage.setItem('HotKeyOpenPhrase', 'Ctrl+F3');
        storage.setItem('HotKeyPrintScreen', 'Ctrl+F4');
        let arrays = ['m1ul1pbk_7241778','3acubvds_724172237','711f1dll_92111137','ixkmdn8o_92511195','amabnve9_925111956','kvnmc2ii_925175016', 'zuyo07x0_110101011','za7xtb8c_121717350','z9vqbk1p_1917383','z2k8ne8o_1101583','xfnixlwh_11015255','x8lmcs1m_122619129','x2sgrlrl_116182520','wxayftgx_1107095522','w92y088n_1916217'];
        storage.setItem('TopSession', JSON.stringify(arrays));
        // console.log('IsAutomaticLogin:' + storage.getItem('IsAutomaticLogin'));
        // console.log('TopSession:' + storage.getItem('TopSession'));
        let config = storage.getAll();
        if (config) {
          for (const key in config) {
            if (config.hasOwnProperty(key)) {
              console.log(`${key}:${config[key]}`)
            }
          }
        }
        // let arrays = JSON.parse(storage.getItem('TopSession'));
        // let index = arrays.indexOf('uxtyftyf_110151228')
        // arrays.splice(index, 1);
        // let arrays = ['m1ul1pbk_7241778','3acubvds_724172237','711f1dll_92111137','ixkmdn8o_92511195','amabnve9_925111956','kvnmc2ii_925175016', 'zuyo07x0_110101011','za7xtb8c_121717350','z9vqbk1p_1917383','z2k8ne8o_1101583','xfnixlwh_11015255','x8lmcs1m_122619129','x2sgrlrl_116182520','wxayftgx_1107095522','w92y088n_1916217'];
        // storage.setItem('TopSession', JSON.stringify(arrays));
        // settings.set('LastLoginUserName', this.username)
        // settings.set('LastLoginUserPwd', util.aesEncrypt(this.password))
        // console.log(util.aesDecrypt(settings.get('LastLoginUserPwd')))
      }
    }
  }

  ipc.on('showmessage', function(event, message) {
    // iview.Message.success(storage.getItem('userSessionID'));
    // console.log('3:' + message);
  })
</script>

<style lang="less">
@import "../assets/less/global.less";
body { font-family: 'Source Sans Pro', sans-serif; }

.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: @view-top;
    line-height: @view-top;
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

.login_view {
  position: absolute;
  top: @view-top;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
  // padding: @view-padding;
}

.login_area {
  width: 400px;
  height: 470px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#logo {
  width: 100px;
  height: auto;
  margin-top: 60px;
}

.btn_login {
  width: 200px;
  background: #5FDD9A;
  border-color: #5FDD9A;
  margin-top: 25px;
}
</style>
