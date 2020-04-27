// 使IE支持 getElementsByClassName
if (!('getElementsByClassName' in document)) {
  function getElementsByClassName (classList) {
    if (typeof classList !== 'string') throw TypeError('the type of classList is error')
    // 获取父元素
    var parent = this
    // 获取相应子元素
    var child = parent.getElementsByTagName('*')
    var nodeList = []
    // 获得classList的每个类名 解决前后空格 以及两个类名之间空格不止一个问题
    var classAttr = classList.replace(/^\s+|\s+$/g, '').split(/\s+/)
    for (var j = 0, len = child.length; j < len; j++) {
      var element = child[j]
      for (var i = 0, claLen = classAttr.length; i < claLen; i++) {
        var className = classAttr[i]
        if (element.className.search(new RegExp('(\\s+)?'+className+'(\\s+)?')) === -1) break
      }
      if (i === claLen) nodeList.push(element)
    }
    return nodeList
  }
  // 兼容ie5及以上的document的getElementsByClassName接口
  document.getElementsByClassName = getElementsByClassName
  // 兼容ie8及以上的getElementsByClassName接口
  window.Element.prototype.getElementsByClassName = getElementsByClassName
}

// 使IE支持 classList
if (!("classList" in document.documentElement)) {
  Object.defineProperty(window.Element.prototype, 'classList', {
    get: function () {
      var self = this
 
      function update(fn) {
        return function () {
          var className = self.className.replace(/^\s+|\s+$/g, ''),
            valArr = arguments
 
          return fn(className, valArr)
        }
      }
 
      function add_rmv (className, valArr, tag) {
        for (var i in valArr) {
          if(typeof valArr[i] !== 'string' || !!~valArr[i].search(/\s+/g)) throw TypeError('the type of value is error')
          var temp = valArr[i]
          var flag = !!~className.search(new RegExp('(\\s+)?'+temp+'(\\s+)?'))
          if (tag === 1) {
            !flag ? className += ' ' + temp : ''
          } else if (tag === 2) {
            flag ? className = className.replace(new RegExp('(\\s+)?'+temp),'') : ''
          }
        }
        self.className = className
        return tag
      }
 
      return {
        add: update(function (className, valArr) {
          add_rmv(className, valArr, 1)
        }),
 
        remove: update(function (className, valArr) {
          add_rmv(className, valArr, 2)
        }),
 
        toggle: function (value) {
          if(typeof value !== 'string' || arguments.length === 0) throw TypeError("Failed to execute 'toggle' on 'DOMTokenList': 1 argument(string) required, but only 0 present.")
          if (arguments.length === 1) {
            this.contains(value) ? this.remove(value) : this.add(value)
            return
          }
          !arguments[1] ? this.remove(value) : this.add(value)
        },
 
        contains: update(function (className, valArr) {
          if (valArr.length === 0) throw TypeError("Failed to execute 'contains' on 'DOMTokenList': 1 argument required, but only 0 present.")
          if (typeof valArr[0] !== 'string' || !!~valArr[0].search(/\s+/g)) return false
          return !!~className.search(new RegExp(valArr[0]))
        }),
 
        item: function (index) {
          typeof index === 'string' ? index = parseInt(index) : ''
          if (arguments.length === 0 || typeof index !== 'number') throw TypeError("Failed to execute 'toggle' on 'DOMTokenList': 1 argument required, but only 0 present.")
          var claArr = self.className.replace(/^\s+|\s+$/, '').split(/\s+/)
          var len = claArr.length
          if (index < 0 || index >= len) return null
          return claArr[index]
        }
      }
    }
  })
}





var swiperIt = {
  timer: null,
  init: function (cont, config) {
    this.config = config
    var _this = this
    var showSlider = _this.config.showSlider || 5
    var width = _this.config.width || 36
    var step = _this.config.step || 0.8
    this.styleList = []
    this.cont = cont
    // 轮播图总数量
    this.contL = cont.children
    // 算出活跃项目
    var activeIndex = Math.floor(showSlider / 2)
    this.activeIndex = activeIndex

    // 判断是否有分页器
    if (_this.config.pagination) {
      var html = ''
      for (var ind = 0; ind < this.contL.length; ind ++) {
        html += '<div class="pagination-item" ind="'+ ind +'"></div>'
      }
      _this.config.pagination.innerHTML = html
    }

    for (var ind = 0; ind < this.contL.length; ind++) {
      // 和活跃卡片位置的差距
      var disparity = Math.abs(ind - activeIndex)
      
      // 距离过远的不再计算位置因为不会显示出来
      if (disparity > activeIndex) disparity = activeIndex
      // console.log(disparity, activeIndex)
      this.styleList[ind] = {"classData":"swiper-item"}
      // 判断是否为可见卡片
      if (ind < showSlider) {
        this.styleList[ind].classData += ' show'
      } else {
        this.styleList[ind].classData += ' hide'
      }
      // 判断是否为活跃项目
      if (ind === activeIndex) this.styleList[ind].classData += ' active'
      
      var scale = Math.pow(step, disparity)
      
      // 计算出合适的宽度
      this.styleList[ind].width = (scale * width).toFixed(2) + '%'
      // 计算出合适的高度
      this.styleList[ind].height = Math.ceil(scale * 100) + '%'
      // 计算距离左边的位置
      var positionStep =  (100 - width) / 2 / activeIndex
      if (ind <= activeIndex) {
        this.styleList[ind].left = (ind * positionStep).toFixed(2) + '%'
      } else if (ind < showSlider) {
        // 因为缩小产生的偏移量
        var p = (1 - scale) * width
        this.styleList[ind].left = (ind * positionStep + p).toFixed(2) + '%'
      } else {
        this.styleList[ind].left = (100 - Math.ceil(scale * width)) / 2 + '%'
      }
      // 计算出层级关系
      this.styleList[ind].zIndex = ind < showSlider ? showSlider - disparity : -1
    }

    this.move()
    // 判断是否自动轮播
    if (_this.config.autoplay) {
      // 鼠标悬浮停止轮播
      this.addEventListener(cont, 'mouseover', function (e) {
        setTimeout(function() {
          if (!_this.isPause) _this.stopAutoPlay()
        }, 0);
      })
      // 鼠标移出开始轮播
      this.addEventListener(cont, 'mouseout', function (e) {
        setTimeout(function() {
          if (_this.isPause) _this.startAutoPlay()
        }, 0);
      })
      if (Function.bind) {
        // 当前窗口得到焦点
        window.onfocus = _this.startAutoPlay.bind(_this)
        // 当前窗口失去焦点
        window.onblur = _this.stopAutoPlay.bind(_this)
      }
      
      setTimeout(function() {
        _this.startAutoPlay()
      }, 0)
    }
    // 注册触摸事件
    var touchMoveX = 0
    var touchMoveXMove = 0
    this.addEventListener(cont, 'touchstart', function (e) {
      console.log('触摸开始!')
      touchMoveX = e.touches[0].pageX
      _this.isTouching = true
    })
    this.addEventListener(cont, 'touchmove', function (e) {
      touchMoveXMove = e.touches[0].pageX
    })
    this.addEventListener(cont, 'touchend', function (e) {
      console.log('触摸结束!', touchMoveXMove - touchMoveX)
      if ((touchMoveXMove - touchMoveX) > 100) {
        _this.prev()
      } else if ((touchMoveXMove - touchMoveX) < -100) {
        _this.next()
      }
      _this.isTouching = false
    })
    return this
  },
  startAutoPlay: function () {
    var _this = this
    if (this.timer) return
    // 开启自动轮播
    this.timer = setInterval(function () {
      if (!_this.isPause && !_this.isTouching) _this.next()
    }, _this.config.autoplay)
    console.log('开启轮播!', _this.timer)
    // 事件回调
    if (_this.config.start) {
      _this.config.start(this.activeIndex)
    }
  },
  stopAutoPlay: function () {
    console.log('停止轮播!', this.timer)
    clearInterval(this.timer)
    this.timer = null
  },
  move: function () {
    if (this.config.pagination) {
      this.config.pagination.children[this.activeIndex].classList.add('active')
    }
    for (var i = 0; i < this.contL.length; i++) {
      this.animate(this.contL[i], this.styleList[i])
    }
    if (this.config.slideChange) {
      this.config.slideChange(this.activeIndex)
    }
  },
  isTouching: false,
  // 暂停计时器
  isPause: null,
  next: function () {
    // 避免频繁刷新
    if (this.isPause) clearTimeout(this.isPause)
    var _this = this
    this.isPause = setTimeout(function() {
      _this.isPause = null
    }, 3000)
    // 停止自动播放
    if (this.config.pagination) {
      this.config.pagination.children[this.activeIndex].classList.remove('active')
    }
    
    this.activeIndex++
    if (this.activeIndex >= this.contL.length) this.activeIndex = 0
    this.styleList.unshift(this.styleList.pop())
    this.move()
  },
  prev: function () {
    // 避免频繁刷新
    var _this = this
    if (this.isPause) clearTimeout(this.isPause)
    this.isPause = setTimeout(function() {
      _this.isPause = null
    }, 3000)
    
    if (this.config.pagination) {
      this.config.pagination.children[this.activeIndex].classList.remove('active')
    }
    this.activeIndex--
    
    if (this.activeIndex < 0) this.activeIndex = this.contL.length - 1
    this.styleList.push(this.styleList.shift())
    this.move()
  },
  animate: function (obj, styleList, fn) {
    setTimeout(function () {
      for(var styleItem in styleList) {
        var value = styleList[styleItem]
        if(styleItem == 'zIndex'){
          obj.style[styleItem] = styleList[styleItem];
        } else if(styleItem=='opacity'){
          obj.style[styleItem]=value/100;
          obj.style.filter='alpha(opacity='+value+')';
        } else if (styleItem == 'left') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem == 'right') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem == 'width') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem == 'height') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem != 'classData') {
          // console.log(value)
          obj.style[styleItem] = value + 'px';
        }
      }
      obj.setAttribute("class", styleList.classData);
      if (fn) {
        fn();
      }
    }, 10)
  },
  addEventListener: function (dom, name, func) {
    if (dom.attachEvent) {    
      dom.attachEvent(name, func);    
    } else if (window.addEventListener) {    
      dom.addEventListener(name, func, false);      
    }  
  }
}
