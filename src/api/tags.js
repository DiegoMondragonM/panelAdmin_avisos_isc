import { apiFetch } from './client'

export function listTags() {
  return apiFetch('/tags')
}
