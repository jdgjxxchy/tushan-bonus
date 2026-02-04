<template>
  <div class="flex flex-col min-h-screen">
    <TheNavbar />
    <main class="flex-1 px-4 pb-10 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
      <slot />
    </main>
    <footer class="py-6 text-center text-sm text-gray-400">
      &copy; {{ new Date().getFullYear() }} 兔扇 - 全兔出击，扇至定居！
    </footer>
  </div>
</template>
