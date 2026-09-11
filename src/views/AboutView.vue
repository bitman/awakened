<script setup lang="ts">
import { site } from '@/content/site'
</script>

<template>
  <div class="page">
    <p class="lede">About</p>
    <h1>{{ site.name }}</h1>
    <div class="prose">
      <p>{{ site.about }}</p>
      <p>
        This is a members’ space. One stream is long-form writing. Another is a curated selection from our WhatsApp
        group. Sign-in comes next so the pages stay inside the group.
      </p>
    </div>
    <figure class="figure">
      <img src="/images/aw_members_2.jpg" alt="People gathered around a large oak" />
    </figure>
  </div>
</template>
