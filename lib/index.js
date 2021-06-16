import axios from 'axios';

function generateReqKey(config) {
  var method = config.method,
      url = config.url,
      params = config.params,
      data = config.data;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

var pendingRequest = new Map();

function addPendingRequest(config) {
  var requestKey = generateReqKey(config);
  config.cancelToken = config.cancelToken || new axios.CancelToken(function (cancel) {
    if (!pendingRequest.has(requestKey)) {
      pendingRequest.set(requestKey, cancel);
    }
  });
}

function removePendingRequest(config) {
  var requestKey = generateReqKey(config);

  if (pendingRequest.has(requestKey)) {
    var cancelToken = pendingRequest.get(requestKey);
    cancelToken(requestKey);
    pendingRequest["delete"](requestKey);
  }
}

function cancelRepeatRequest() {
  axios.interceptors.request.use(function (config) {
    removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求

    addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中

    return config;
  }, function (error) {
    return Promise.reject(error);
  });
  axios.interceptors.response.use(function (response) {
    removePendingRequest(response.config); // 从pendingRequest对象中移除请求

    return response;
  }, function (error) {
    removePendingRequest(error.config || {}); // 从pendingRequest对象中移除请求

    if (axios.isCancel(error)) {
      console.log('已取消的重复请求：' + error.message);
    }

    return Promise.reject(error);
  });
}

function retryRequest() {
  axios.interceptors.response.use(null, function (err) {
    var config = err.config;
    if (!config || !config.retryTimes) return Promise.reject(err);

    var _config$__retryCount = config.__retryCount,
        __retryCount = _config$__retryCount === void 0 ? 0 : _config$__retryCount,
        _config$retryDelay = config.retryDelay,
        retryDelay = _config$retryDelay === void 0 ? 300 : _config$retryDelay,
        retryTimes = config.retryTimes; // 在请求对象上设置重试次数


    config.__retryCount = __retryCount; // 判断是否超过了重试次数

    if (__retryCount >= retryTimes) {
      return Promise.reject(err);
    } // 增加重试次数


    config.__retryCount++; // 延时处理

    var delay = new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, retryDelay);
    }); // 重新发起请求

    return delay.then(function () {
      return axios(config);
    });
  });
}

export { cancelRepeatRequest, retryRequest };
