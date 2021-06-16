(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios')) :
  typeof define === 'function' && define.amd ? define(['exports', 'axios'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.handyjs = {}, global.axios));
}(this, (function (exports, axios) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

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
    config.cancelToken = config.cancelToken || new axios__default['default'].CancelToken(function (cancel) {
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
    axios__default['default'].interceptors.request.use(function (config) {
      removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求

      addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中

      return config;
    }, function (error) {
      return Promise.reject(error);
    });
    axios__default['default'].interceptors.response.use(function (response) {
      removePendingRequest(response.config); // 从pendingRequest对象中移除请求

      return response;
    }, function (error) {
      removePendingRequest(error.config || {}); // 从pendingRequest对象中移除请求

      if (axios__default['default'].isCancel(error)) {
        console.log('已取消的重复请求：' + error.message);
      }

      return Promise.reject(error);
    });
  }

  exports.cancelRepeatRequest = cancelRepeatRequest;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
