---
title: Vue 3でシンプルなデータテーブルコンポーネントを実装する
description: ライブラリを使わずにVue 3でシンプルなテーブルコンポーネントを実装。カラム定義とデータ駆動のアプローチで再利用性を高めた実装例を解説します。
navigation: true
draft: false
created: 2023-10-18
updated: 2025-05-04
image: null
tags:
  - Vue.js
  - Table
  - Component
  - TypeScript
  - UI/UX
icons:
  - devicon:vuejs
  - mdi:grid
---

# シンプルなデータテーブルコンポーネントの作成

個人開発をしている際に、テーブルを表示する必要が出てきました。

## 背景

[daisyUI](https://daisyui.com/)には見た目を整える機能はありましたが、
テーブルを扱いやすくする機能はありませんでした。

以前は[ag-grid](https://www.ag-grid.com/)をよく使用していましたが、
今回の用途ではそこまでの機能は必要なかったため、
シンプルなテーブルコンポーネントを自作することにしました。

## 実装

機能は最低限のもので、見た目もシンプルな実装となっています。

### DataTable.vue

```vue
<script setup>
const props=defineProps({
  id: {
    type: String,
    required: true
  },
  columDefs: {
    type: Array,
    required: false
  },
  rowData: {
    type: Array,
    required: false
  },
})

</script>
<template>
  <div class="rounded-lg border-2">
    <table :id="id" class="table">
      <!-- head -->
      <thead>
        <tr>
          <td 
            v-for="(col,colIndex) in props.columDefs"
            :key="'col-head-' + colIndex">
            {{ col['headerName'] }}
          </td>
        </tr>
      </thead>
      <!-- tbody -->
      <tbody>
        <tr v-for="(row,rowIndex) in rowData" :key="'row-'+rowIndex">
          <template
            v-for="(col,colIndex) in props. columDefs"
            :key="'col-body-' + colIndex">
            <td>{{ row[col.fild] }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style lang="">

</style>
```

### 使用例

```vue
<script setup>
import DataTable from './DataTable.vue'
const columDefs= [
  { headerName: 'Row ID', field: 'id' },
  { headerName: 'Row make', field: 'make' },
  { headerName: 'Row model', field: 'model' },
  { headerName: 'Row price', field: 'price' },
]
const rowData = [
  { id: 'c1', make: 'Toyota', model: 'Celica', price: 35000 },
  { id: 'c2', make: 'Ford', model: 'Mondeo', price: 32000 },
  { id: 'c8', make: 'Porsche', model: 'Boxster', price: 72000 },
  { id: 'c4', make: 'BMW', model: 'M50', price: 60000 },
  { id: 'c14', make: 'Aston Martin', model: 'DBX', price: 190000 },
]
</script>

<template>
    <DataTable :columDefs="columDefs" :row-data="rowData" />
</template>
```

### 表示結果

![An image](https://raw.githubusercontent.com/SphereStacking/PortfolioV2/refs/heads/main/content/2.blog/2023/1018-image.avif)
