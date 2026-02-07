<script setup lang="ts">
// すべてのtalkコンテンツを取得
const { data: talks } = await useAsyncData('debug-talks', async () => {
  const allTalks = await queryCollection('talk').all()
  return allTalks
})

// 生のqueryContentを使ってtalkコンテンツを取得
const { data: rawTalks } = await useAsyncData('debug-raw-talks', async () => {
  const rawTalks = await queryContent('talk').find()
  return rawTalks
})

// すべてのblogコンテンツを取得（比較用）
const { data: blogs } = await useAsyncData('debug-blogs', async () => {
  const allBlogs = await queryCollection('blog').limit(5).all()
  return allBlogs
})

// 特定のパスでクエリテスト
const testPaths = [
  '/talk/2024/08/24/vr-event-sharing-service-development',
  '/6.talk/2024/08/24/vr-event-sharing-service-development',
  '/2024/08/24/vr-event-sharing-service-development',
  'talk/2024/08/24/vr-event-sharing-service-development',
  '6.talk/2024/08/24/vr-event-sharing-service-development',
]

const { data: pathTests } = await useAsyncData('debug-path-tests', async () => {
  const results = []
  for (const testPath of testPaths) {
    const result = await queryCollection('talk').path(testPath).first()
    results.push({
      testPath,
      found: !!result,
      actualPath: result?._path,
      fullResult: result,
    })
  }
  return results
})

// whereクエリのテスト（エラーを避けるため個別に試す）
const { data: whereTests } = await useAsyncData('debug-where-tests', async () => {
  const results = []

  try {
    // whereの代わりにタイトルでフィルタリング
    const allTalks = await queryCollection('talk').all()
    const filtered = allTalks.filter(talk =>
      talk.title?.toLowerCase().includes('vr'),
    )
    results.push({
      method: 'filter by title',
      count: filtered.length,
      paths: filtered.map(t => t._path || t.path || 'NO_PATH'),
    })
  }
  catch (error) {
    results.push({
      method: 'filter by title',
      error: error.message,
    })
  }

  return results
})
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">
      Talk Paths Debug
    </h1>

    <!-- Talkコンテンツのパス一覧 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        All Talk Contents
      </h2>
      <div class="bg-muted p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(talks?.map(t => ({
          _path: t._path,
          _id: t._id,
          _dir: t._dir,
          title: t.title,
        })), null, 2) }}</pre>
      </div>
    </section>

    <!-- 生のqueryContentでのTalkコンテンツ -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        Raw Talk Contents (queryContent)
      </h2>
      <div class="bg-muted p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(rawTalks?.map(t => ({
          _path: t._path,
          _id: t._id,
          _dir: t._dir,
          title: t.title,
        })), null, 2) }}</pre>
      </div>
    </section>

    <!-- Blogコンテンツのパス比較 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        Blog Contents (for comparison)
      </h2>
      <div class="bg-muted p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(blogs?.map(b => ({
          _path: b._path,
          _id: b._id,
          _dir: b._dir,
          title: b.title,
        })), null, 2) }}</pre>
      </div>
    </section>

    <!-- パスクエリテスト結果 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        Path Query Tests
      </h2>
      <div class="bg-muted p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(pathTests, null, 2) }}</pre>
      </div>
    </section>

    <!-- whereクエリテスト結果 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        Where Query Tests
      </h2>
      <div class="bg-muted p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(whereTests, null, 2) }}</pre>
      </div>
    </section>

    <!-- 現在のルートパラメータ -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">
        Route Information
      </h2>
      <div class="bg-muted p-4 rounded-lg">
        <p>Current Path: {{ $route.path }}</p>
        <p>Params: {{ JSON.stringify($route.params) }}</p>
      </div>
    </section>
  </div>
</template>
