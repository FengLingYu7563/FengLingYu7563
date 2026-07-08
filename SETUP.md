# GitHub Profile README 設定方式

這份封面是給 GitHub profile special repository 使用的。

## 1. 建立 repository

在 GitHub 建立一個 repository，名稱必須和你的 GitHub 使用者名稱完全一樣。

你的帳號是 `FengLingYu7563`，repository 名稱也要是：

```text
FengLingYu7563
```

GitHub 會自動把這個 repo 的 `README.md` 顯示在你的個人首頁。

## 2. 替換佔位內容

在 `README.md` 裡搜尋並替換：

- `FengLingYu7563`: 你的 GitHub 使用者名稱或想顯示的名字
- `you@example.com`: 你的 email
- `your-site.example.com`: 你的作品集或個人網站
- `YOUR_LINKEDIN`: 你的 LinkedIn slug
- `project-one`, `project-two`, `project-three`: 你的代表專案

在 `assets/profile-banner.svg` 裡搜尋並替換：

- `FengLingYu7563`
- `Developer / Learner / Builder`
- `Learning in public. Building with code.`

## 3. 上傳檔案

把這些檔案放到該 repository：

```text
README.md
assets/profile-banner.svg
SETUP.md
```

`SETUP.md` 只是給你自己參考，不一定要保留在 GitHub 上。

## 4. GitHub Stats 自動更新

這份 profile 使用 GitHub Actions 產生本地 SVG：

```text
assets/github-stats.svg
assets/top-langs.svg
assets/discord-bot-demo-card.svg
assets/wynnmaze-card.svg
```

workflow 位於：

```text
.github/workflows/update-github-stats.yml
```

它會每天自動更新一次，也可以在 GitHub 的 Actions 頁面手動按 `Run workflow`。README 讀的是本地 SVG，所以外部 stats 服務暫停時，圖也不會直接消失。

## 5. 風格調整方向

目前這版是深色、乾淨、偏工程感的 profile 封面。若想更接近你給的參考，可以往這幾個方向調：

- 極簡型：保留橫幅、簡介、技術棧，移除太多統計卡。
- 個人品牌型：把 banner 文字改成你的定位，例如 `Frontend Developer`、`AI Builder`。
- 專案展示型：把 Featured Work 改成你最想被看到的 3 個 repo。
