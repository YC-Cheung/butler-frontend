import request from '@/utils/request'

export function getPerms(query) {
  return request({
    url: '/permissions',
    method: 'get',
    params: query
  })
}

export function addPerm(data) {
  return request({
    url: '/permissions',
    method: 'post',
    data
  })
}

export function updatePerm(id, data) {
  return request({
    url: `/permissions/${id}`,
    method: 'patch',
    data
  })
}

export function deletePerm(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'delete'
  })
}
