import hasPerm from './hasPerm'

export default {
  inserted(el, binding) {
    if (el && binding.value) {
      console.log('current user has required permission: ' + binding.value + '? --> ' + hasPerm(binding.value))
      if (!hasPerm(binding.value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}
