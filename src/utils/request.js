import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const showError = res => {
  const { message: msg } = res.data
  msg && Message.error(msg)
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const { data: { data }, status } = response
    return { data, status }
  },
  error => {
    console.log('err' + error) // for debug
    const { response: res } = error

    if (res) {
      switch (res.status) {
        case 404:
          Message.error('访问资源不存在')
          break
        case 401:
          Message.error('登录已失效，请重新登录')
          break
        case 400:
          showError(res)
          break
        case 403:
          showError(res)
          break
        case 422:
          Message.error('参数格式错误')
          break
        case 429:
          Message.error('操作太频繁，请稍后再试')
          break
        default:
          Message.error(`服务器异常(code: ${res.status})`)
          break
      }
    } else {
      if (err instanceof axios.Cancel) {
        console.log(err.toString())
      } else {
        debounceMsg('请求失败')
      }
    }
  }
)

export default service
