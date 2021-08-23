module.exports = {
  pluginOptions: {
    electronBuilder: {
      // 自定义协议，同时需要修改background.js中的load
      customFileProtocol: 'myapp://./',
      // build参数
      builderOptions: {
        appId: 'com.myapp',
        productName: 'myapp',
        electronDownload: {
          mirror: 'https://npm.taobao.org/mirrors/electron/'
        },
        electronVersion: '12.0.10',
      }
    }
  }
}
/**
 *   "build": {
    "productName": "electron-builder-start",
    "appId": "org.groove.electron-builder-start",
    "directories": {
      "output": "dist"
    },

    "nsis": {
      "oneClick": false,
      "allowElevation": true,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "electron-builder-start"
    },
    "extends": null,
    "dmg": {
      "contents": [
        {
          "x": 410,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 130,
          "y": 150,
          "type": "file"
        }
      ]
    },
    "mac": {
      "hardenedRuntime": true,
      "entitlements": "public/build/entitlements.mac.plist",
      "entitlementsInherit": "public/build/entitlements.mac.plist"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            "ia32"
          ]
        }
      ]
    },
    "linux": {
    }
  },

 */
