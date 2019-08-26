import request from '@/utils/request'

export default {
  loginByUsername(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  },

  logout() {
    return request({
      url: '/auth/logout',
      method: 'post'
    })
  },

  getInfo() {
    return request({
      url: '/auth/info',
      method: 'get'
    })
  }
}
