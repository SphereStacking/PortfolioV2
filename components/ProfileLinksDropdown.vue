<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'

const profile = useMyProfile()
const links = Object.values(profile.links)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="h-9 w-9">
        <MoreHorizontal class="h-4 w-4" />
        <span class="sr-only">Profile links menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel>Links</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          v-for="link in links"
          :key="link.name"
          as-child>
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 cursor-pointer">
            <Icon :name="link.icon" class="h-4 w-4" />
            <span>{{ link.name }}</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
