<script setup lang="ts">
import { appName } from '~/constants'

useHead({
  title: appName,
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ]
})
</script>

<template>
  <VitePwaManifest />
  <n-notification-provider>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans text-gray-700 dark:text-gray-200 transition-colors duration-300">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </n-notification-provider>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  color-scheme: dark;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
