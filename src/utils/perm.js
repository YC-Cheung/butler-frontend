import hasPerm from '@/directive/perm/hasPerm'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPerm(value) {
  if (!hasPerm(value)) {
    return false
  }
  return true
}
