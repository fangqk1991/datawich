import { AdminApp } from '@fangcha/vue/app-admin'

declare global {
  interface Window {
    _datawichApp: AdminApp
  }
}
