<template>
  <div class="container mx-auto py-6">
    <h1 class="text-3xl font-bold mb-6">
      キーボード入力表示
    </h1>

    <div class="grid gap-6">
      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold">
              現在押されているキー
            </h3>
            <p class="text-sm text-(--ui-text-muted)">
              キーボードのキーを押すと、キー情報が表示されます
            </p>
          </div>
        </template>
        <div class="min-h-[200px] flex items-center justify-center">
          <TransitionGroup name="fade">
            <div v-if="currentKey && isKeyPressed" :key="currentKey.timestamp" class="text-center">
              <div class="text-6xl font-bold mb-4 text-primary">
                {{ currentKey.combination }}
              </div>
              <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div class="text-left">
                  <p class="text-sm text-muted-foreground">
                    Key:
                  </p>
                  <p class="font-mono">
                    {{ currentKey.key }}
                  </p>
                </div>
                <div class="text-left">
                  <p class="text-sm text-muted-foreground">
                    Code:
                  </p>
                  <p class="font-mono">
                    {{ currentKey.code }}
                  </p>
                </div>
                <div class="text-left">
                  <p class="text-sm text-muted-foreground">
                    Key Code:
                  </p>
                  <p class="font-mono">
                    {{ currentKey.keyCode }}
                  </p>
                </div>
                <div class="text-left">
                  <p class="text-sm text-muted-foreground">
                    修飾キー:
                  </p>
                  <div class="flex gap-2">
                    <UBadge v-if="currentKey.ctrlKey" color="neutral" variant="soft">
                      Ctrl
                    </UBadge>
                    <UBadge v-if="currentKey.altKey" color="neutral" variant="soft">
                      Alt
                    </UBadge>
                    <UBadge v-if="currentKey.shiftKey" color="neutral" variant="soft">
                      Shift
                    </UBadge>
                    <UBadge v-if="currentKey.metaKey" color="neutral" variant="soft">
                      Meta
                    </UBadge>
                    <span v-if="!currentKey.ctrlKey && !currentKey.altKey && !currentKey.shiftKey && !currentKey.metaKey" class="text-muted-foreground">
                      なし
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else :key="'placeholder'" class="text-center text-muted-foreground">
              <Icon name="ph:keyboard" class="text-6xl mb-4" />
              <p>キーを押してください</p>
            </div>
          </TransitionGroup>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold">
              キー入力履歴
            </h3>
            <p class="text-sm text-(--ui-text-muted)">
              最近押されたキーの履歴（最大10件）
            </p>
          </div>
        </template>
        <div v-if="keyHistory.length > 0" class="space-y-2">
          <TransitionGroup name="list">
            <div
              v-for="(keyEvent, index) in keyHistory"
              :key="keyEvent.timestamp"
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              :class="{ 'opacity-50': index > 2 }">
              <div class="flex items-center gap-4">
                <UBadge variant="outline" class="font-mono">
                  {{ keyEvent.combination }}
                </UBadge>
                <div class="text-sm text-muted-foreground">
                  <span class="font-mono">{{ keyEvent.code }}</span>
                  <span class="mx-2">·</span>
                  <span>KeyCode: {{ keyEvent.keyCode }}</span>
                </div>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ formatTime(keyEvent.timestamp) }}
              </div>
            </div>
          </TransitionGroup>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground">
          <Icon name="ph:clock-counter-clockwise" class="text-2xl mb-2" />
          <p>履歴がありません</p>
        </div>
        <template v-if="keyHistory.length > 0" #footer>
          <UButton variant="outline" size="sm" @click="clearHistory">
            <Icon name="ph:trash" class="mr-2" />
            履歴をクリア
          </UButton>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">
            使い方
          </h3>
        </template>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">
              基本的な使い方
            </h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>キーボードの任意のキーを押すと、キー情報が表示されます</li>
              <li>修飾キー（Ctrl、Alt、Shift、Meta）との組み合わせも検出できます</li>
              <li>押されたキーの履歴が自動的に記録されます</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-2">
              表示される情報
            </h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Key:</strong> 押されたキーの文字（例: "a", "Enter", " "）</li>
              <li><strong>Code:</strong> 物理的なキーの識別子（例: "KeyA", "Enter", "Space"）</li>
              <li><strong>Key Code:</strong> キーの数値コード（非推奨ですが参考情報として表示）</li>
              <li><strong>修飾キー:</strong> 同時に押されている修飾キーの状態</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-2">
              活用例
            </h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>キーボードショートカットの開発・デバッグ</li>
              <li>キーボードレイアウトの確認</li>
              <li>ゲーム開発でのキー入力テスト</li>
              <li>アクセシビリティテスト</li>
            </ul>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { currentKey, keyHistory, isKeyPressed, clearHistory } = useKeyboardDisplay({
  maxHistory: 10,
})

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
