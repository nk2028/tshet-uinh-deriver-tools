# qieyun-deriver-tools

推導方案相關功能，用以使推導方案更便於調用。

## 使用方法

### 推導方案編寫

```js
// 演示用方案：直接返回 "d:" 後加地位描述
if (!音韻地位) {
  // 提供選項
  const params = [
    ["兼容模式", false],
    ["最簡描述", false],
  ];
  if (選項.兼容模式) {
    params.push(["$legacy", true]);
  } else {
    params.push(["正則化", true]);
  }
  return params;
}
// 實行推導
if (選項.正則化) {
  音韻地位 = Qieyun.適配分析體系.v2(音韻地位);
}
return "d:" + (選項.最簡描述 ? 音韻地位.最簡描述 : 音韻地位.描述);
```

### 調用

```js
import { 推導方案 } from "qieyun-deriver-tools";
import * as Qieyun from "qieyun";

const from = Qieyun.音韻地位.from描述;

const 原始方案 = new Function("Qieyun", "選項 = {}", "音韻地位", "字頭 = null", 方案代碼).bind(undefined, Qieyun);

const 方案 = new 推導方案(原始方案);

方案()(from("幫凡入")); // => "d:幫三凡入"，以預設選項推導
方案({ 最簡描述: true })(from("幫凡入")); // => "d:幫凡入"，指定選項推導

// 「指定選項」和「推導」均會分別調用一次原推導函數
// 為了減省原函數調用次數，避免反覆指定並解析相同的選項
// 可以像這樣指定一次選項後批量推導
const 以預設選項推導 = 方案(); // 預設選項
for (const 地位 of Qieyun.資料.iter音韻地位()) {
  以預設選項推導(地位);
}

方案.方案選項().鍵值.get("正則化"); // => true，獲取指定選項的預設值或可選值
方案.方案選項({ 兼容模式: true }).鍵值.has("正則化"); // => false，選項列表可能依給定選項有所變化（高級用法）
```
