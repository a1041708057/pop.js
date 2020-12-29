import React, {
    Component
} from 'react';
import ReactDOM from "react-dom";
import {
    flushPage
} from './ViewCtrl';

//默认的弹窗动画,注意命名syn_防止和其他className重名
const syn_zoom = `
.syn_zoom {
    animation: syn_zoom 0.3s linear 0s 1;
}
@keyframes syn_zoom {
    0% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
  
    66% {
      -webkit-transform: scale(1.1);
      transform: scale(1.1)
    }
  
    100% {
      -webkit-transform: scale(1);
      transform: scale(1)
    }
}`

const syn_fade_in = `
.syn_fade_in {
    animation: syn_fade_in 0.3s linear 0s 1;
}
@keyframes syn_fade_in {
    0% {
       opacity:0;
    }
  
    100% {
      opacity:1;
    }
}
`


const anis = [syn_zoom, syn_fade_in]



export const PopCtrl = (function () {
    function PopCtrl() {
        //弹窗注册Map
        this._popMap = new Map()
        // 存储所有弹出的弹窗
        this._wins = []
        //最外层div
        this.m = null
        //弹窗灰蒙层
        this.b = null
        //当前的弹窗
        this._nowWin = null
        //已显示被插队的弹窗
        this._hideWins = []
        //已显示被插队的弹窗dom
        this._hideDomWins = []
    }

    PopCtrl.getInstance = function () {
        if (PopCtrl.ins == null) {
            PopCtrl.ins = new PopCtrl()
            //初始化弹窗蒙层
            PopCtrl.ins.createWinBg()
            //添加默认动画配置    
            PopCtrl.ins.addAni(anis)
        }
        return PopCtrl.ins
    }

    PopCtrl.prototype.createWinBg = function () {
        this.m = document.createElement('div');
        this.b = document.createElement('div');
        this.m.appendChild(this.b)
        this.m.style.cssText = 'z-index:1999'
        this.b.style.cssText = 'z-index:1999;width:750px; height:1624px; background:#000; position:fixed; left:0; top:0; opacity:0.6;'
        document.body.appendChild(this.m);
        //默认隐藏
        this.m.style.display = "none"

        this.b.addEventListener("click", (...arg) => {
            this.closeWin(...arg)
        }, this)
    }

    PopCtrl.prototype.addAni = function (anis) {
        // 创建style标签
        const style = document.createElement('style');
        // 将 keyframes样式写入style内
        anis.forEach(ani => style.innerHTML += ani)
        // 将style样式存放到head标签
        document.getElementsByTagName('head')[0].appendChild(style);
    }


    PopCtrl.prototype.registerWin = function (key, T) {
        this._popMap.set(key, T)
    }

    PopCtrl.prototype.insertWin = function (enumComKey, data = {}, immediateShow = false, clickGrayClose = false, animation = "syn_zoom") {
        const T = this._popMap.get(enumComKey)
        if (!T) {
            console.error(enumComKey + " 弹窗未配置")
            return
        }
        //显示蒙层
        this.m.style.display = ""
        const win = {
            T,
            data,
            clickGrayClose,
            animation
        }

        if (!immediateShow) {
            //把弹窗放入，只显示第一个
            this._wins.push(win)
            if (!this._nowWin) {
                this.showWin()
            }
        } else {
            if (this._nowWin) {
                this.m.removeChild(this.n)
                this._hideDomWins.push(this.n)
                this._hideWins.push(this._nowWin)
                this._nowWin = null
            }

            //插队
            this._wins.unshift(win)
            this.showWin()
        }
    }


    PopCtrl.prototype.showWin = function () {
        this._nowWin = this._wins.shift()
        if (this._nowWin) {
            //弹窗渲染div
            this.n = document.createElement('div');
            //点击灰色区域关闭
            if (this._nowWin.clickGrayClose) {
                this.n.style.pointerEvents = "none"
                this.b.style.pointerEvents = ""
            } else {
                this.b.style.pointerEvents = "none"
            }
            this.n.style.width = '100%'
            this.n.style.height = '100%'
            this.n.style.zIndex = 1999
            this.n.style.top = 0
            this.n.style.position = "fixed"
            //弹窗动画 防止className重复
            this.n.className = this._nowWin.animation
            this.m.appendChild(this.n)

            document.body.style.overflowY = "hidden"
            document.body.style.position = "fixed"


            const T = < this._nowWin.T closeWin = {
                (...arg) => {
                    this.closeWin(...arg)
                }
            }
            data = {
                this._nowWin.data
            }
            />
            ReactDOM.render(T, this.n);
        }
    }


    PopCtrl.prototype.resumeWin = function () {
        this.m.appendChild(this.n)

        document.body.style.overflowY = "hidden"
        document.body.style.position = "fixed"


        const T = < this._nowWin.T closeWin = {
            (...arg) => {
                this.closeWin(...arg)
            }
        }
        data = {
            this._nowWin.data
        }
        />
        ReactDOM.render(T, this.n);
    }

    PopCtrl.prototype.closeWin = function (cb) {
        this._nowWin = null
        //整个移除,执行回调
        this.m.removeChild(this.n)

        if (this._hideDomWins.length > 0) {
            this.n = this._hideDomWins.pop()
            this._nowWin = this._hideWins.pop()
            this.resumeWin()
            return
        }


        if (typeof cb == 'function') {
            try {
                cb()
            } catch (error) {
                console.log(error)
            }
        }

        if (this._wins.length == 0 && !this._nowWin) {
            document.body.style.overflowY = "auto"
            document.body.style.position = ""
        }

        //存在弹下一个，并且没有弹下一个，否则隐藏蒙层
        this._wins[0] ? !this._nowWin && this.showWin() : !this._nowWin && (this.m.style.display = "none");
    }

    return PopCtrl

}())


/**
 * 显示弹窗
 * @param {*} enumComKey 弹窗类名
 * @param {*} data 数据 默认{}
 * @param {*} immediateShow 插队 默认false
 * @param {*} clickGrayClose 点击灰色背景 默认false
 * @param {*} animation 动画 默认syn_zoom
 */
export const showWin = (...arg) => {
    PopCtrl.getInstance().insertWin(...arg)
}


/**
 * 注册弹窗
 * @param {*} T 弹窗组件
 */
export const registerWin = (key, T) => {
    PopCtrl.getInstance().registerWin(key, T)
}
