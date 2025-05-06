---
title: "LaravelでMermaid形式のER図を生成するカスタムコマンド"
description: LaravelのプロジェクトでデータベースのスキーマからMermaid形式のER図を自動生成します。
navigation: true
draft: false
created: 2024-05-23
updated:
image:
tags:
  - "Laravel"
  - "Mermaid"
  - "ER図"
icons:
  - "devicon:laravel"
  - "simple-icons:mermaid"
---


LaravelのプロジェクトでデータベースのスキーマからMermaid形式のER図を自動生成します。

この記事では、カスタムコマンドを作成し、PostgreSQLデータベースからカラム情報とリレーションを取得してER図を生成します。

:::note warn
注意
postgres限定
正しく生成するにはDBの制約を設定(外部key、ユニーク制約)している必要がある。
ポリモーフィック関連などは対応していない!
:::

## 必要なパッケージのインストール

まず、必要なパッケージをインストールします。doctrine/dbalパッケージは、データベーススキーマ操作に必要です。

``` sh
composer require doctrine/dbal
```

## カスタムコマンドの作成

次に、カスタムコマンドを作成します。`app/Console/Commands/`ディレクトリに`GenerateMermaidERD.php`ファイルを作成し、以下の内容を記述します。

``` php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class GenerateMermaidERD extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:mermaid-erd {path?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate ERD in Mermaid format';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $path = $this->argument('path') ?? storage_path('app/ERD.mmd');

        // ファイルが既に存在する場合、上書き確認を行う
        if (File::exists($path)) {
            if (!$this->confirm("指定したパスにファイルが既に存在します。上書きしますか？")) {
                $this->info('操作がキャンセルされました。');
                return;
            }
        }

        $tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        $tableNames = array_map(function($table) {
            return $table->table_name;
        }, $tables);

        $mermaid = "erDiagram\n";

        foreach ($tableNames as $table) {
            $columns = DB::select("
                SELECT
                    c.column_name,
                    c.data_type,
                    pgd.description
                FROM
                    information_schema.columns c
                LEFT JOIN
                    pg_catalog.pg_description pgd
                ON
                    pgd.objsubid = c.ordinal_position
                AND pgd.objoid = (
                    SELECT
                        MIN(oid)
                    FROM
                        pg_catalog.pg_class
                    WHERE
                        relname = c.table_name
                )
                WHERE
                    c.table_name = ?
            ", [$table]);

            $mermaid .= "    $table {\n";
            foreach ($columns as $column) {
                $dataType = str_replace(' ', '_', $column->data_type);
                $comment = $column->description ? ' "' . $column->description . '"' : '';
                $mermaid .= "        " . $dataType . " " . $column->column_name . $comment . "\n";
            }
            $mermaid .= "    }\n";
        }

        // リレーションを追加
        $foreignKeys = DB::select("
            SELECT
                tc.table_name AS from_table,
                kcu.column_name AS from_column,
                ccu.table_name AS to_table,
                ccu.column_name AS to_column,
                tc.constraint_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
        ");

        $uniqueConstraints = DB::select("
            SELECT
                tc.table_name AS table_name,
                kcu.column_name AS column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'UNIQUE'
        ");

        $uniqueColumns = [];
        foreach ($uniqueConstraints as $unique) {
            $uniqueColumns[$unique->table_name][] = $unique->column_name;
        }

        foreach ($foreignKeys as $foreignKey) {
            $fromTable = $foreignKey->from_table;
            $fromColumn = $foreignKey->from_column;
            $toTable = $foreignKey->to_table;
            $toColumn = $foreignKey->to_column;

            // 1対多のリレーション
            if (in_array($fromColumn, $uniqueColumns[$fromTable] ?? [])) {
                $relation = "|o--o|"; // 1:1
            } elseif (in_array($toColumn, $uniqueColumns[$toTable] ?? [])) {
                $relation = "|o--|{"; // 多:1
            } else {
                $relation = "}o--o{"; // 多:多
            }

            $mermaid .= "    $fromTable $relation $toTable : \"$fromColumn -> $toColumn\"\n";
        }

        File::put($path, $mermaid);

        $this->info("Mermaid ERDが生成されました: $path");
    }
}

```

## コマンドの登録

カスタムコマンドをアプリケーションに登録するために、`app/Console/Kernel.php`ファイルに以下の行を追加します。

``` php
protected $commands = [
    \App\Console\Commands\GenerateMermaidERD::class,
];
```

## コマンドの実行

カスタムコマンドを実行して、Mermaid形式のER図を生成します。

- デフォルトの出力パス (storage/app/ERD.mmd) を使用する場合

    ``` sh
    php artisan generate:mermaid-erd
    ```

- カスタムの出力パスを指定する場合

    ``` sh
    php artisan generate:mermaid-erd /path/to/your/custom/location/ERD.mmd
    ```

ファイルが既に存在する場合、上書きするかどうかの確認が日本語で表示されます。

## 動作

<XPost x-post-id="1793299781957349443"/>

## まとめ

これで、LaravelのデータベーススキーマからMermaid形式のER図を自動生成することができるようになりました:crocodile:

DBに変更を加えた時のer図ちまちま更新ともおさらばです。
