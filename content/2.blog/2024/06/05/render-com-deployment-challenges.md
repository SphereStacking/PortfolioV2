---
title: "苦しすぎた Render.comへのデプロイ"
description: "Laravel 10、Sail、Jetstream、Inertia、Vue 3、SSRを用いたRender.comへのデプロイの経験と学びを共有"
navigation: true
draft: false
created: 2024-06-05
updated:
image:
tags:
  - "Laravel"
  - "Render.com"
  - "Docker"
  - "SSR"
  - "Deployment"
icons:
  - "devicon:laravel"
  - "simple-icons:render"
---

個人開発でweb アプリの開発中に思い立って本番環境のデプロイを試してみたら大きな沼にはまってしまったので備忘録として。

 中身は読まなくてもよいという方は最後にまとめてコードを載せていますので参考にしてください。

> 2024/05/05 追記
> 最終的に laravel forge にてデプロイすることにしました。
> 有料ですがlaravel公式がサポートしているため
> サポートが充実していていました。 

### 私の環境( とりあえず関係ありそうなのだけ列挙 )

| php | 8.2 |
| --- | --- |
| laravel/framework | 10.10 |
| laravel/jetstream | 4.0 |
| @inertiajs/vue3 | 1.0.14 |
| vue | 3.2.31 |
| vite | 4.0.0 |

- ローカルではsailを使用して開発
- inertiaをssrモードにしている


## Render 公式サイトのドキュメント

[Deploy a PHP Web App with Laravel and Docker | Render Docs](https://docs.render.com/deploy-php-laravel-docker)
renderのlaravel用公式ドキュメントがlaravel5.8(2024/02/12)へのドキュメントしかなく。このままでは動かない。


### 今回、乗り越えた問題

1. render.comのsecretfilesに設定した.envが参照できない問題。
2. ドメインのルートのみでしかpageが正しく表示されない
3. `php artisan inertia:start-ssr` の実行場所について
4. Vite manifest not found と怒られる
5. ssrモードでziggyのroute()関数が `ReferenceError: route is not defined`となる

### render.comのsecretfilesに設定した.envが参照できない問題。   

#### 原因
![Untitled.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3486455/b245552b-e05b-a226-686b-91d4bbd2a297.png)
    
`+ Add Secret File`に`.env` を置くと自動的にlaravel側でも読み込んでくれると思ってたが違った。

#### 解決方法
dockerfileでファイルをアプリケーションのルートフォルダにコピーする。

```bash
# syntax = docker/dockerfile:1.2      
    
### 省略 ###
    
RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cp /etc/secrets/.env .
```
    
### ドメインのルートのみでしかpageが表示されない
    
下記のようにルート以外はpage not foundとなってしまう。

https://twitter.com/SphereVR/status/1756462644612177973

#### 原因
inertiaをssrモードにしていたのにサーバーを実行していなかったため。
https://inertiajs.com/server-side-rendering

#### 解決方法

`php artisan inertia:start-ssr`を実行する。


### Vite manifest not found と怒られる

#### 原因
`public/build/manifest.json`が見つからずエラーとなっていた。

build途中でメモリ不足となりkillされていたため最後まで走り切ってなかった。

![Untitled (1).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3486455/5c6db03b-0dc7-c821-dce5-c46135972893.png)    

#### 解決方法
        
有料版のメモリ1Gに切り替えてbuildを実行した
25$/月かかるためどうするか迷っている。。。
    

### ssrモードの起動の実行場所について

inrtiaをssrモードで使用する場合に`php artisan inertia:start-ssr`を実行する必要がある。

今回使用したdockerimageは `richarvey/nginx-php-fpm:3.1.6`     
こちらは[ドキュメント](https://github.com/richarvey/nginx-php-fpm/tree/main/docs)を見てもらえばわかる通りscriptsを記述することができるため
    
/scripts/01-front-build.shの中で起動していた。
    
 ```bash
    #!/usr/bin/env bash
    # パッケージのインストール
    npm install
    # ビルド
    npm run build
    # ssrサーバー起動
    php artisan inertia:start-ssr
```
    
そうしたらすべてのルートで下記の画面が出てくるようになってしまった。
    
https://twitter.com/SphereVR/status/1756881128668184765
    

#### 解決方法
 

[Infrastructure as Code (IaC)](https://docs.render.com/infrastructure-as-code)の`render.yaml` にてstartCommandで実行してあげないといけなかった。
    
![Untitled (2).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3486455/410bd9de-4bdd-f355-8730-c2526d3cecf4.png)

### 5. ssrモードでziggyのroute()関数が `ReferenceError: route is not defined`となる

下記は両方ともSSRでなければ動くのだが
SSRモードにした際はパターン2で記述する必要がある。
template内でroute()を呼び出せないみたい

パターン1
```
<script setup>
const pages = {
    return{
        hoge : route('hoge.index'),
        fuga : route('fuga.index'),
        piyo : route('piyo.index'), 
    }
}
</script>
<template>
  <div>
    <a v-for="(page, name) in pages" :key="name" :href="page">{{ name }}</a>
  </div>
</template>
```

パターン2
```
<script setup>
const pages = () => {
    hoge : route('hoge.index'),
    fuga : route('fuga.index'),
    piyo : route('piyo.index'), 
}
</script>
<template>
  <div>
    <a v-for="(page, name) in pages" :key="name" :href="page">{{ name }}</a>
  </div>
</template>
```

(20240605追記)

ssr.jsに下記を+したらTemplate内でもrouteを参照できるようになりました。
```
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createInertiaApp } from '@inertiajs/vue3'
import createServer from '@inertiajs/vue3/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { ZiggyVue } from '../../vendor/tightenco/ziggy/dist/vue.m'

+ import { route } from 'ziggy-js' 

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
    setup({ App, props, plugin }) {
+      const Ziggy = {
+        // Pull the Ziggy config off of the props.
+        ...props.initialPage.props.ziggy,
+        // Build the location, since there is
+        // no window.location in Node.
+        location: new URL(props.initialPage.props.ziggy.url)
+      }
+      globalThis.route = (name, params, absolute, config = Ziggy) =>
+        route(name, params, absolute, config)
      return createSSRApp({ render: () => h(App, props) })
        .use(plugin)
        .use(ZiggyVue, {
          ...page.props.ziggy,
          location: new URL(page.props.ziggy.location),
        })
    },
  })
)

```



### 最後にどなたかの参考になれば 
    
[Deploy Laravel and Memcache on Render.com: The Complete Guide - MemCachier Blog](https://blog.memcachier.com/2023/07/12/deploy-laravel-and-memcache-on-render-the-complete-guide/)の記事を参考にセットアップしております。
- Dockerfile
    ```
    # syntax = docker/dockerfile:1.2
    # Dockerfile
    # Use base image for container
    FROM richarvey/nginx-php-fpm:3.1.6
    
    # Copy all application code into your Docker container
    COPY . .
    
    RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cp /etc/secrets/.env .
    
    RUN apk update
    
    # Install the `npm` package
    RUN apk add --no-cache npm
    
    
    CMD ["/start.sh"]
    
    ```
- render.yml
    ```bash
        databases:
          - name: app-db
            plan: free
            databaseName: v_shelf_db
            user: webapp
        
        services:
          - type: web
            plan: standard
            name: app
            runtime: docker
            startCommand: 'php artisan inertia:start-ssr'
            envVars:
              - fromGroup: app-secrets
              - fromGroup: app-share-secrets
              # Database
              - key: DATABASE_URL
                fromDatabase:
                  name: app-db
                  property: connectionString
              - key: DB_CONNECTION
                value: pgsql
              # Laravel
              - key: APP_URL
                value: https://app.onrender.com
              - key: APP_KEY
                sync: false
              - key: APP_ENV
                value: production
              - key: APP_DEBUG
                value: false
              - key: LOG_CHANNEL
                value: stderr
              - key: MEILISEARCH_HOST
                value: app-meilisearch
              # Image-specific vars (richarvey/nginx-php-fpm)
              - key: WEBROOT
                value: /var/www/html/public
              - key: RUN_SCRIPTS
                value: 1
              - key: REAL_IP_HEADER
                value: 1
              - key: SKIP_COMPOSER
                value: 1
          - type: web
            name: app-meilisearch
            env: docker
            repo: https://github.com/ShakeSpheres/meilisearch-jp-docker-to-render.git
            plan: starter
            disk:
              name: meili-data
              mountPath: /meili-data
              sizeGB: 5
            envVars:
              - fromGroup: app-share-secrets
              - key: MEILI_HTTP_ADDR
                value: 0.0.0.0:80
              - key: MEILI_DB_PATH
                value: /meili-data
              - key: MEILI_ENV
                value: development
        envVarGroups:
        - name: app-share-secrets
          envVars:
            - key: MEILI_MASTER_KEY
              generateValue: true
    ```

- .dockerignore

    ```
    # .dockerignore
    .DS_Store
    .dockerignore
    .editorconfig
    .env
    .env.backup
    .env.example
    .env.production
    .git
    .gitattributes
    /.fleet
    /.idea
    /.phpunit.cache
    /.vscode
    Homestead.json
    Homestead.yaml
    Dockerfile
    README.md
    /auth.json
    /node_modules
    /npm-debug.log
    /phpunit.result.cache
    /public/build
    /public/hot
    /public/storage
    /phpunit.xml
    storage/app/*
    storage/framework/cache/*
    storage/framework/sessions/*
    storage/framework/views/*
    storage/logs/*
    tests
    /vendor
    yarn-error.log
    ```
- scripts/00-laravel-setup.sh
    ```
    #!/usr/bin/env bash
    echo "Running composer"
    composer install --no-dev --working-dir=/var/www/html
    
    echo "Caching config..."
    php artisan config:cache
    
    echo "Caching routes..."
    php artisan route:cache
    
    echo "Running migrations..."
    php artisan migrate --force
    ```
- scripts/01-front-build.sh
    ```
    #!/usr/bin/env bash
    
    # パッケージのインストール
    npm install
    
    # ビルド
    npm run build
    ```
- conf/nginx/nginx-site.conf
    ```
    server {
      # Render provisions and terminates SSL
      listen 80;
    
      # Make site accessible from http://localhost/
      server_name _;
    
      root /var/www/html/public;
      index index.html index.htm index.php;
    
      # Disable sendfile as per https://docs.vagrantup.com/v2/synced-folders/virtualbox.html
      sendfile off;
    
      # Add stdout logging
      error_log /dev/stdout info;
      access_log /dev/stdout;
    
      # block access to sensitive information about git
      location /.git {
        deny all;
        return 403;
      }
    
      add_header X-Frame-Options "SAMEORIGIN";
      add_header X-XSS-Protection "1; mode=block";
      add_header X-Content-Type-Options "nosniff";
    
      charset utf-8;
    
      location / {
          try_files $uri $uri/ /index.php?$query_string;
      }
    
      location = /favicon.ico { access_log off; log_not_found off; }
      location = /robots.txt  { access_log off; log_not_found off; }
    
      error_page 404 /index.php;
    
      location ~* \.(jpg|jpeg|gif|png|css|js|ico|webp|tiff|ttf|svg)$ {
        expires 5d;
      }
    
      location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
        include fastcgi_params;
      }
    
      # deny access to . files
      location ~ /\. {
        log_not_found off;
        deny all;
      }
    
      location ~ /\.(?!well-known).* {
        deny all;
      }
    }
    ```

### 参考にした情報一覧

- [How to host Laravel applications on Render - General - Render](https://community.render.com/t/how-to-host-laravel-applications-on-render/12853)
- [Laravel php error Vite manifest not found - General - Render](https://community.render.com/t/laravel-php-error-vite-manifest-not-found/14040/6)
- [Deploy Laravel and Memcache on Render.com: The Complete Guide - MemCachier Blog](https://blog.memcachier.com/2023/07/12/deploy-laravel-and-memcache-on-render-the-complete-guide/)
- https://github.com/tighten/ziggy/discussions/564
