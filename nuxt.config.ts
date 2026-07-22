// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head: {
      meta: [
        {
          name: 'mobile-web-app-capable',
          content: 'yes'
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes'
        }
      ]
    }
  },
  // Only load the PWA module in production — in dev it injects /dev-sw.js
  // which causes VUE_ROUTER_R0004 noise even with devOptions.enabled: false
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    ...(!isDev ? ['@vite-pwa/nuxt'] : []),
  ],
  pwa: {
    manifest: {
      name: 'Construction Materials Shop Management System',
      short_name: 'ShopManager',
      description: 'Construction Materials Shop Inventory & POS Management System',
      theme_color: '#0f172a',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
      backendBase: process.env.NUXT_PUBLIC_BACKEND_BASE || 'http://localhost:8000'
    }
  },
  css: ['~/assets/css/main.css']
})
