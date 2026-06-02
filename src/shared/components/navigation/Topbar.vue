<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { Button, TopbarControls } from '@/shared/components'

const router = useRouter()

const goDashboard = () => {
  void router.push('/test-data/input')
}
</script>

<template>
  <header class="navbar bg-base-100 border-b border-base-200 px-4 md:px-6 min-h-14">
    <div class="flex-1">
      <RouterLink
        to="/test-data/input"
        class="text-xl font-bold text-base-content hover:opacity-80"
      >
        Test Data Generator
      </RouterLink>
    </div>
    <nav class="flex-none flex items-center gap-2">
      <TopbarControls />
      <div class="dropdown dropdown-end sm:hidden">
        <label tabindex="0" class="btn btn-ghost btn-sm btn-square">
          <Menu class="w-5 h-5" />
        </label>
        <ul
          tabindex="0"
          class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
        >
          <li>
            <a @click="goDashboard">Test Data Input</a>
          </li>
        </ul>
      </div>
      <div class="divider divider-horizontal mx-0 hidden sm:flex"></div>
      <Button variant="primary" class="btn-sm hidden sm:inline-flex" @click="goDashboard">
        Test Data Input
      </Button>
    </nav>
  </header>
</template>
