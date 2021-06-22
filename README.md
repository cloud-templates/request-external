## usage

### 重复请求取消

> 1. 删除相同的请求
> 2. 在路由跳转或者组件注销的时候，发出去的请求判断为无用请求，通过config中的fromRoute字段判断是否为路由中的请求（因为有些是vuex 或者其他地方的请求，不应该被清除掉

```javascript
import axios from 'axios'
import { cancelExtraRequest } from 'axios-external'

const option = {
  cancelComponentRequest: false 	// 默认为false
}
cancelExtraRequest(option)
```



### 请求失败重试

> 请求失败后会发起重试

``` javascript
import axios from 'axios'
import { retryRequest } from 'axios-external'

cancelRepeatRequest()
```



#### axios 调用配置

```javascript
let config = {
  method,
  baseURL,
  url,
  retryTimes: 0,
  retryDelay: 300,
  fromRoute: true
}
axios(config)
```



#### config 参数

| 参数名     | 默认值 | 说明                                 |
| ---------- | ------ | ------------------------------------ |
| fromRoute  | true   | 是否是来自路由的请求                 |
| retryTimes | 0      | 重试次数，请求失败后会重新发送多少次 |
| retryDelay | 300    | 重试请求发送的间隔                   |

#### option 参数

| 参数名                 | 默认值 | 说明                                      |
| ---------------------- | ------ | ----------------------------------------- |
| cancelComponentRequest | false  | 当组件destroy的时候，清除组件中的多余请求 |

