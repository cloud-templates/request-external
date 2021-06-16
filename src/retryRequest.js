import axios from 'axios'

export function retryRequest () {
  axios.interceptors.response.use(null, (err) => {
    const config = err.config
    if (!config || !config.retryTimes) return Promise.reject(err)
    const { __retryCount = 0, retryDelay = 300, retryTimes } = config
    // 在请求对象上设置重试次数
    config.__retryCount = __retryCount
    // 判断是否超过了重试次数
    if (__retryCount >= retryTimes) {
      return Promise.reject(err)
    }
    // 增加重试次数
    config.__retryCount++
    // 延时处理
    const delay = new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, retryDelay)
    })
    // 重新发起请求
    return delay.then(function () {
      return axios(config)
    })
  })
}
