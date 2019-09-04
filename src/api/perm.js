import request from '@/utils/request'

export function getPerms(query) {
  return request({
    url: '/perms',
    method: 'get',
    params: query
  })
}

export function addPerm(data) {
  return request({
    url: '/perms',
    method: 'post',
    data
  })
}

export function updatePerm(id, data) {
  return request({
    url: `/perms/${id}`,
    method: 'patch',
    data
  })
}

export function deletePerm(id) {
  return request({
    url: `/perms/${id}`,
    method: 'delete'
  })
}

export function getPermOptions() {
  return request({
    url: '/perm-options',
    method: 'get'
  })
}
