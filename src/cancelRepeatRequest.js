import axios from 'axios'

function generateReqKey (config) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

const pendingRequest = new Map()

function addPendingRequest (config) {
  const requestKey = generateReqKey(config)
  config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
    if (!pendingRequest.has(requestKey)) {
      pendingRequest.set(requestKey, cancel)
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

export function cancelRepeatRequest () {
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
