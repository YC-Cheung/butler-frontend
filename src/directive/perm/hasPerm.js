import store from '@/store'

export default function(permStr) {
  if (!permStr || permStr === '') return true

  if (store.getters.perms.some(perm => perm === '*')) return true

  return store.getters.perms.some(perm => perm === permStr)
}
