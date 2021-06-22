import Vue from 'vue'
import axios from 'axios'

const pendingRequest = new Map()
let clearRequestFlag = false

function generateReqKey (config) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

function addPendingRequest (config) {
  const requestKey = generateReqKey(config)
  config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
    if (!pendingRequest.has(requestKey)) {
      pendingRequest.set(requestKey, config)
    }
  })
}

function removePendingRequest (config) {
  const requestKey = generateReqKey(config)
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey)
    cancelToken(requestKey)
    pendingRequest.delete(requestKey)
  }
}

function cancelRequestWhenComponentDestroy () {
  clearRequestFlag = true
  Vue.mixin({
    beforeDestroy () {
      if (clearRequestFlag) return
      clearRequestFlag = true
      const timer = setTimeout(() => {
        clearRequestFlag = false
        clearRequestMap()
        clearTimeout(timer)
      }, 0)
    }
  })
}

function clearRequestMap () {
  pendingRequest.forEach((config) => {
    const {
      fromRoute = true
    } = config
    if (fromRoute) {
      removePendingRequest(config)
    }
  })
}

export function cancelExtraRequest ({
  cancelComponentRequest = false
}) {
  // 默认为false，如果设置了，则在页面destroy的时候清除请求
  if (cancelComponentRequest) {
    cancelRequestWhenComponentDestroy()
  }
  axios.interceptors.request.use(
    (config) => {
      removePendingRequest(config) // 检查是否存在重复请求，若存在则取消已发的请求
      addPendingRequest(config) // 把当前请求信息添加到pendingRequest对象中
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    (response) => {
      removePendingRequest(response.config) // 从pendingRequest对象中移除请求
      return response
    },
    (error) => {
      removePendingRequest(error.config || {}) // 从pendingRequest对象中移除请求
      if (axios.isCancel(error)) {
        console.log('已取消的重复请求：' + error.message)
      }
      return Promise.reject(error)
    }
  )
}
