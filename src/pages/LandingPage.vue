<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronUp } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div
    class="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden bg-base-100"
  >
    <!-- 打破第四面牆：浮動提醒，箭頭指向上方登入按鈕 -->
    <div
      class="fixed top-14 right-6 z-[100] hidden lg:flex flex-col items-center gap-1 pointer-events-none"
      aria-hidden="true"
    >
      <ChevronUp class="w-5 h-5 text-primary shrink-0" />
      <span
        class="start-here-callout px-4 py-2 rounded-xl bg-base-100 text-primary font-bold text-sm shadow-xl border-2 border-primary/50"
      >
        {{ t('landing.startHere') }}
      </span>
    </div>

    <!-- 背景裝飾：簡單的呼吸光暈，營造腦波/靈感氛圍 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse-slow"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse-slow delay-1000"
      ></div>
    </div>

    <!-- 主內容區 -->
    <div class="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <!-- 標題 -->
      <div class="space-y-4">
        <h1
          class="text-4xl sm:text-5xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-fade-in-up"
        >
          {{ t('landing.title') }}
        </h1>
        <p
          class="text-base sm:text-xl md:text-2xl text-base-content/80 font-light tracking-wide max-w-2xl mx-auto animate-fade-in-up delay-200"
        >
          {{ t('landing.subtitle') }}
        </p>
      </div>

      <!-- 裝飾線條 -->
      <div
        class="w-24 h-1 bg-gradient-to-r from-transparent via-base-content/20 to-transparent mx-auto"
      ></div>

      <!-- 介紹文案 -->
      <p class="text-sm sm:text-base text-base-content/60 animate-fade-in-up delay-300">
        {{ t('landing.ready') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 自定義簡單動畫，不依賴外部庫 */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-x {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 8s infinite ease-in-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0; /* 初始隱藏 */
}

.animate-bounce-x {
  animation: bounce-x 1.5s infinite ease-in-out;
}

.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-1000 {
  animation-delay: 1s;
}

/* 打破第四面牆：輕微浮動，像在對使用者說話的提醒 */
.start-here-callout {
  animation: start-here-float 3s ease-in-out infinite;
}
@keyframes start-here-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
