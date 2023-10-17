(function () {
  const {
    randomNum,
    basicWordCount,
    key: AIKey,
    Referer: AIReferer,
    switchBtn,
    mode: initialMode,
  } = GLOBAL_CONFIG.postHeadAiDescription;

  const { title, postAI, pageFillDescription } = GLOBAL_CONFIG_SITE;

  function getRandomString(len) {
    let _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
      min = 0,
      max = _charStr.length - 1,
      _str = '';                    //定义随机字符串 变量
    //判断是否指定长度，否则默认长度为15
    len = len || 15;
    //循环生成字符串
    for (var i = 0, index; i < len; i++) {
      index = (function (randomIndexFunc, i) {
        return randomIndexFunc(min, max, i, randomIndexFunc);
      })(function (min, max, i, _self) {
        let indexTemp = Math.floor(Math.random() * (max - min + 1) + min),
          numStart = _charStr.length - 10;
        if (i == 0 && indexTemp >= numStart) {
          indexTemp = _self(min, max, i, _self);
        }
        return indexTemp;
      }, i);
      _str += _charStr[index];
    }
    return _str;
  }

  function wxConfig() {
    if (WEIXIN_CONFIG.enable) {
      const timestamp = Math.floor(new Date().getTime() / 1000);
      const nonceStr = getRandomString(30);
      const requestParams = new URLSearchParams({
        timestamp: timestamp,
        noncestr: nonceStr,
        url: WEIXIN_SHARE_CONF.url
      });
      console.log("requestParams=", requestParams);
      const requestOptions = {
        method: "GET",
        mode: 'cors',
        headers: {
          "Content-Type": "application/json",
          Referer: GLOBAL_CONFIG.postHeadAiDescription.AIReferer,
        },
      };
      try {
        const response = fetch(`${WEIXIN_CONFIG.getSignApiURL}?${requestParams}`, requestOptions)
          .then(response => response.json())
          .then(json => {
            console.log(json);
            const signature = json.signature;
            console.log(signature);
            wx.config({
              debug: WEIXIN_CONFIG.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
              appId: WEIXIN_CONFIG.appId, // 必填，公众号的唯一标识
              timestamp: timestamp, // 必填，生成签名的时间戳
              nonceStr: nonceStr, // 必填，生成签名的随机串
              signature: signature,// 必填，签名
              jsApiList: WEIXIN_CONFIG.jsApiList // 必填，需要使用的JS接口列表
            });
            wx.error(function (res) {
              console.log('wx config error: ', res);
              // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            });
            wx.ready(function () {   //需在用户可能点击分享按钮前就先调用
              console.log('conf success: ', WEIXIN_CONFIG, 'timestamp=', timestamp, 'nonceStr=', nonceStr, 'signature=', signature);
              weixin_share_info_get();
            });
          })
          .catch(err => console.log('Request Failed', err));

      } catch (error) {
        console.error("请求发生错误❎:", error);
      }
    }
  }

  function weixin_share_info_get() {
    wx.updateAppMessageShareData({
      title: WEIXIN_SHARE_CONF.title, // 分享标题
      desc: WEIXIN_SHARE_CONF.desc, // 分享描述
      link: WEIXIN_SHARE_CONF.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: WEIXIN_SHARE_CONF.imgUrl, // 分享图标
      success: function () {
        // 设置成功
        console.log('set wx updateAppMessageShareData success');
      }
    });
    wx.updateTimelineShareData({
      title: WEIXIN_SHARE_CONF.title, // 分享标题
      link: WEIXIN_SHARE_CONF.url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: WEIXIN_SHARE_CONF.imgUrl, // 分享图标
      success: function () {
        // 设置成功
        console.log('set wx updateTimelineShareData success');
      }
    });
  }

  wxConfig();

})();
