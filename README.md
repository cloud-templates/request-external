## usage

### 重复请求取消

```javascript
import axios from 'axios'
import { cancelRepeatRequest } from 'axios-external'

cancelRepeatRequest()
```



### 请求失败重试

``` javascript
import axios from 'axios'
import { retryRequest } from 'axios-external'

cancelRepeatRequest()

// 请求的地方 
axios({
  method,
  baseURL,
  url,
  retryTimes: 0,
  retryDelay: 300
})
```

#### retryTimes

重试次数，请求失败后会重新发送多少次

#### retryDelay

重试请求发送的间隔

