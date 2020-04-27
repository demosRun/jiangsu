var screenInfo = {
  ua: navigator.userAgent
}

// 判断浏览器类型
screenInfo.isWindowsPhone = /(?:Windows Phone)/.test(screenInfo.ua),
screenInfo.isSymbian = /(?:SymbianOS)/.test(screenInfo.ua) || screenInfo.isWindowsPhone, 
screenInfo.isAndroid = /(?:Android)/.test(screenInfo.ua), 
screenInfo.isFireFox = /(?:Firefox)/.test(screenInfo.ua), 
screenInfo.isChrome = /(?:Chrome|CriOS)/.test(screenInfo.ua),
screenInfo.isTablet = /(?:iPad|PlayBook)/.test(screenInfo.ua) || (screenInfo.isAndroid && !/(?:Mobile)/.test(screenInfo.ua)) || (screenInfo.isFireFox && /(?:Tablet)/.test(screenInfo.ua))
screenInfo.isIPhone = /(?:iPhone)/.test(screenInfo.ua) && !screenInfo.isTablet,
screenInfo.isPc = !screenInfo.isIPhone && !screenInfo.isAndroid && !screenInfo.isSymbian;
screenInfo.isIE = (window.navigator.userAgent.indexOf("MSIE") >= 1)
if (screenInfo.isPc) {
  if (window.location.href.indexOf('usePhone') > 0) {
    document.body.classList.add('phone')
    screenInfo.isPc = false
    var viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute('content', 'initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
  } else {
    document.body.classList.add('pc')
  }
  
} else {
  if (window.location.href.indexOf('usePc') > 0) {
    document.body.classList.add('pc')
    screenInfo.isPc = true
    var viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute('content', 'width=1200, user-scalable=no');
  } else {
    document.body.classList.add('phone')
  }
}

if (screenInfo.isIE) {
  document.body.classList.add('ie')
}

function getScreenInfo() {
  screenInfo.width = document.documentElement.clientWidth || document.body.offsetWidth || window.innerWidth
  screenInfo.height = document.documentElement.clientHeight || document.body.offsetHeight || window.innerHeight
    // 屏幕长宽比
  screenInfo.scale = (screenInfo.width / screenInfo.height).toFixed(2)

  // 判断横屏还是竖屏
  if (screenInfo.scale > 1) {
    document.body.classList.remove('vertical')
    document.body.classList.add('horizontal')
  } else {
    document.body.classList.remove('horizontal')
    document.body.classList.add('vertical')
  }
}

getScreenInfo()

var checkTimer = null
if (window.addEventListener) {
  window.addEventListener('resize', function () {
    window.clearTimeout(checkTimer)
    checkTimer = setTimeout(function () {
      getScreenInfo()
    }, 300)
  })
}
