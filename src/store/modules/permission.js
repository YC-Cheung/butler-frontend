import { constantRoutes } from '@/router'
import Layout from '@/layout'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

function dataArrayToRoutes(data) {
  console.log(data)
  const routes = []
  data.forEach(item => {
    const tmp = { ...item }
    if (tmp.component === 'Layout') {
      tmp.component = Layout
    } else {
      let subView = tmp.component
      subView = subView.replace(/^\/*/g, '')
      tmp.component = () => import(`@/views/${subView}`)
    }
    if (tmp.children) {
      tmp.children = dataArrayToRoutes(tmp.children)
    }
    routes.push(tmp)
  })
  return routes
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, menu) {
    return new Promise(resolve => {
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }
      // commit('SET_ROUTES', accessedRoutes)
      console.log(menu)
      const accessedRoutes = dataArrayToRoutes(menu)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
