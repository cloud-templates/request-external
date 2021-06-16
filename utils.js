import Qs from 'qs'
export function generateReqKey(config) {
  const { method, url, params, data } = config;
  return [method, url, Qs.stringify(params), Qs.stringify(data)].join("&")
}

const pendingRequest = new Map()
export function addPendingRequest(config) {
  const requestKey = generateReqKey(config)
  config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
    if (!pendingRequest.has(requestKey)) {
      pendingRequest.set(requestKey, cancel)
    }
  })
}