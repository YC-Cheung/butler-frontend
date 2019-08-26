import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const errorMessage = {
  400: '参数错误',
  401: '登录已失效，请重新登录',
  403: '没有权限，请联系管理员',
  404: '访问资源不存在',
  422: '参数格式不正确',
  500: '服务器发生错误，请稍后再试',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时'
}

const showError = (res) => {
  const { message: msg } = res.data
  Message.error(msg || errorMessage[res.status] || `服务器异常 (code: ${res.status})`)
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_API_DOMAIN + process.env.VUE_APP_API_PREFIX, // url = base url + request url
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
    const { data: { data }, meta, status } = response
    return { data, meta, status }
  },
  error => {
    console.log('err' + error) // for debug
    const { response: res } = error

    if (res) {
      showError(res)
    } else {
      if (error instanceof axios.Cancel) {
        console.log(error.toString())
      } else {
        Message.error('请求失败')
      }
    }
  }
)

export default service
