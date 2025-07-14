<template>
  <div class="container mx-auto py-6">
    <h1 class="text-3xl font-bold mb-6">
      キーボード入力表示
    </h1>

    <div class="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>現在押されているキー</CardTitle>
          <CardDescription>
            キーボードのキーを押すと、キー情報が表示されます
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Badge v-if="currentKey.ctrlKey" variant="secondary">
                        Ctrl
                      </Badge>
                      <Badge v-if="currentKey.altKey" variant="secondary">
                        Alt
                      </Badge>
                      <Badge v-if="currentKey.shiftKey" variant="secondary">
                        Shift
                      </Badge>
                      <Badge v-if="currentKey.metaKey" variant="secondary">
                        Meta
                      </Badge>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>キー入力履歴</CardTitle>
          <CardDescription>
            最近押されたキーの履歴（最大10件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="keyHistory.length > 0" class="space-y-2">
            <TransitionGroup name="list">
              <div
                v-for="(keyEvent, index) in keyHistory"
                :key="keyEvent.timestamp"
                class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                :class="{ 'opacity-50': index > 2 }">
                <div class="flex items-center gap-4">
                  <Badge variant="outline" class="font-mono">
                    {{ keyEvent.combination }}
                  </Badge>
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
        </CardContent>
        <CardFooter v-if="keyHistory.length > 0">
          <Button variant="outline" size="sm" @click="clearHistory">
            <Icon name="ph:trash" class="mr-2" />
            履歴をクリア
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
