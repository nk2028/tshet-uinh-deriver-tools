# tshet-uinh-deriver-tools

推導方案相關功能，用以使推導方案更便於調用。

## 使用方法

### 推導方案編寫

```js
// 演示用方案：直接返回 "<前綴>:<地位描述>"
if (!音韻地位) {
  const params: 選項項目[] = [
    ["前綴", "d"],
    ["高級選項", false],
  ];
  if (選項.高級選項) {
    params.push(["簡略描述", true]);
  }
  return params;
}
return 選項.前綴 + ":" + (選項.簡略描述 ? 音韻地位.簡略描述 : 音韻地位.描述);
```

### 調用

```js
import { 推導方案 } from "tshet-uinh-deriver-tools";
import * as Qieyun from "qieyun";

const from = Qieyun.音韻地位.from描述;

const 原始方案 = new Function("Qieyun", "選項 = {}", "音韻地位", "字頭 = null", 方案代碼).bind(undefined, Qieyun);

const 方案 = new 推導方案(原始方案);

方案()(from("幫三C凡入")); // => "d:幫三C凡入"，以預設選項推導
方案({ 前綴: "D" })(from("幫三C凡入")); // => "d:幫凡入"，指定選項推導

// 「指定選項」和「推導」均會分別調用一次原推導函數
// 為了減省原函數調用次數，避免反覆指定並解析相同的選項
// 可以像這樣指定一次選項後批量推導
const 以預設選項推導 = 方案(); // 預設選項
for (const 地位 of Qieyun.資料.iter音韻地位()) {
  以預設選項推導(地位);
}

方案.方案選項().列表; // 取得解析後的方案選項列表
```
