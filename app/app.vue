<script setup lang="ts">
import { appName } from '~/constants'

useHead({
  title: appName,
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>

<template>
  <VitePwaManifest />
  <n-notification-provider>
    <div class="text-gray-700 font-sans min-h-screen transition-colors duration-300 from-indigo-50 to-cyan-50 via-white bg-gradient-to-br">
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
