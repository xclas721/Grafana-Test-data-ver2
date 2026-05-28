<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader, Input, Modal, Textarea } from '@/shared/components'

const { t } = useI18n()
const showModal = ref(false)
const showModalLarge = ref(false)
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.components.modal')" :subtitle="t('components.subtitle')" />

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.modal.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.modal.desc') }}</p>
      <div class="flex flex-wrap gap-3">
        <Button variant="primary" @click="showModal = true">{{
          t('components.modal.standard')
        }}</Button>
        <Button variant="info" @click="showModalLarge = true">{{
          t('components.modal.large')
        }}</Button>
      </div>

      <Modal v-model="showModal" :title="t('components.modal.standard.title')" size="md">
        <p class="py-4">{{ t('components.modal.standard.content') }}</p>
        <p class="py-4">{{ t('components.modal.standard.content2') }}</p>
        <template #footer>
          <Button variant="ghost" @click="showModal = false">{{ t('ui.cancel') }}</Button>
          <Button variant="primary" @click="showModal = false">{{ t('ui.confirm') }}</Button>
        </template>
      </Modal>

      <Modal v-model="showModalLarge" :title="t('components.modal.large.title')" size="lg">
        <p class="py-4">{{ t('components.modal.large.content') }}</p>
        <div class="space-y-4">
          <Input
            :label="t('form.example.name')"
            :placeholder="t('form.example.name.placeholder')"
          />
          <Input
            :label="t('form.example.email')"
            :placeholder="t('form.example.email.placeholder')"
          />
          <Textarea
            :label="t('form.example.description')"
            :placeholder="t('form.example.description.placeholder')"
          />
        </div>
        <template #footer>
          <Button variant="ghost" @click="showModalLarge = false">{{ t('ui.cancel') }}</Button>
          <Button variant="primary" @click="showModalLarge = false">{{ t('ui.confirm') }}</Button>
        </template>
      </Modal>
    </Card>
  </div>
</template>
