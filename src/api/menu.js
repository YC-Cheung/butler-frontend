import request from '@/utils/request'

export function getMenu(query) {
  return request({
    url: '/menu',
    method: 'get',
    params: query
  })
}

export function addMenu(data) {
  return request({
    url: '/menu',
    method: 'post',
    data
  })
}

export function updateMenu(id, data) {
  return request({
    url: `/menu/${id}`,
    method: 'patch',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: `/menu/${id}`,
    method: 'delete'
  })
}
