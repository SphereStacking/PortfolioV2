<script setup lang="ts">
definePageMeta({
  layout: 'tools',
})

const toast = useToast()

const input = ref('')
const encoded = ref('')
const decoded = ref('')
const isComponent = ref(false)

const encodeUrl = () => {
  try {
    encoded.value = isComponent.value
      ? encodeURIComponent(input.value)
      : encodeURI(input.value)
  }
  catch {
    toast.add({
      title: 'エラー',
      description: 'エンコードに失敗しました',
      color: 'error',
    })
  }
}

const decodeUrl = () => {
  try {
    decoded.value = isComponent.value
      ? decodeURIComponent(input.value)
      : decodeURI(input.value)
  }
  catch {
    toast.add({
      title: 'エラー',
      description: 'デコードに失敗しました',
      color: 'error',
    })
  }
}

const { copyToClipboard } = useCopyToClipboard()

const clearAll = () => {
  input.value = ''
  encoded.value = ''
  decoded.value = ''
}

// サンプルURL
const sampleUrls = [
  {
    name: '日本語検索',
    url: 'https://www.google.com/search?q=東京スカイツリー&hl=ja',
  },
  {
    name: 'メールアドレス',
    url: 'mailto:example@domain.com?subject=お問い合わせ&body=こんにちは',
  },
  {
    name: '特殊文字',
    url: 'https://example.com/path?param1=value&param2=50%割引#section',
  },
  {
    name: 'スペース',
    url: 'https://api.example.com/search?query=hello world&filter=new items',
  },
  {
    name: 'JSON文字列',
    url: 'https://api.example.com/data?json={"name":"田中","age":30}',
  },
  {
    name: 'パス内の日本語',
    url: 'https://example.com/ブログ/記事タイトル/コメント',
  },
]

const loadSampleUrl = (sample: typeof sampleUrls[0]) => {
  input.value = sample.url
}

watchEffect(() => {
  if (input.value) {
    encodeUrl()
    decodeUrl()
  }
  else {
    encoded.value = ''
    decoded.value = ''
  }
})

// SEO設定
useSeoMeta({
  title: 'URLエンコード/デコード | Web開発ツール',
  description: 'URLパラメータの文字列をエンコード・デコード。日本語や特殊文字を含むURLを安全に変換。',
})
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div class="col-span-full">
      <h1 class="text-3xl font-bold mb-2">
        URLエンコード/デコード
      </h1>
      <p class="text-muted-foreground">
        URLパラメータの文字列をエンコード・デコード。日本語や特殊文字を含むURLを安全に変換。
      </p>
    </div>

    <!-- サンプルURL -->
    <UCard class="col-span-full">
      <template #header>
        <div>
          <h3 class="font-semibold">
            サンプルURL
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            よく使用されるURLパターンを選択できます
          </p>
        </div>
      </template>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <UButton
          v-for="sample in sampleUrls"
          :key="sample.name"
          variant="outline"
          size="sm"
          @click="loadSampleUrl(sample)">
          {{ sample.name }}
        </UButton>
      </div>
    </UCard>

    <UCard class="col-span-full">
      <template #header>
        <div>
          <h3 class="font-semibold">
            入力
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            エンコード・デコードしたいテキストまたはURLを入力してください
          </p>
        </div>
      </template>
      <div class="space-y-4">
        <div>
          <textarea
            v-model="input"
            class="w-full min-h-[150px] p-3 rounded-md border bg-background resize-y"
            placeholder="https://example.com/search?q=検索ワード&lang=ja"></textarea>
        </div>

        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">
            <input
              v-model="isComponent"
              type="checkbox"
              class="rounded">
            <span class="text-sm">encodeURIComponent を使用（推奨）</span>
          </label>

          <UButton
            variant="outline"
            size="sm"
            @click="clearAll">
            クリア
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <h3 class="font-semibold">
            エンコード結果
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            特殊文字がURLセーフな形式に変換されます
          </p>
        </div>
      </template>
      <div class="relative">
        <pre class="p-3 rounded-md bg-muted overflow-x-auto min-h-[100px] text-sm">{{ encoded || '入力待ち...' }}</pre>
        <UButton
          v-if="encoded"
          size="sm"
          variant="ghost"
          class="absolute top-2 right-2"
          @click="copyToClipboard(encoded)">
          <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
        </UButton>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <h3 class="font-semibold">
            デコード結果
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            エンコードされた文字列を元に戻します
          </p>
        </div>
      </template>
      <div class="relative">
        <pre class="p-3 rounded-md bg-muted overflow-x-auto min-h-[100px] text-sm">{{ decoded || '入力待ち...' }}</pre>
        <UButton
          v-if="decoded"
          size="sm"
          variant="ghost"
          class="absolute top-2 right-2"
          @click="copyToClipboard(decoded)">
          <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
        </UButton>
      </div>
    </UCard>

    <UCard class="col-span-full">
      <template #header>
        <h3 class="font-semibold">
          使い方のヒント
        </h3>
      </template>
      <div class="space-y-3 text-sm text-muted-foreground">
        <p>
          <strong>encodeURI</strong>: URL全体をエンコード（プロトコルやドメインは変換しない）
        </p>
        <p>
          <strong>encodeURIComponent</strong>: クエリパラメータなど、URLの一部をエンコード（推奨）
        </p>
        <div class="mt-4 p-3 bg-muted rounded-md">
          <p class="font-semibold mb-2">
            よくある使用例：
          </p>
          <ul class="space-y-1 list-disc list-inside">
            <li>日本語を含むURLパラメータの変換</li>
            <li>特殊文字（&amp;、?、#など）を含む値の安全な受け渡し</li>
            <li>APIリクエストのパラメータ構築</li>
            <li>エンコードされたURLの解読・デバッグ</li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>
