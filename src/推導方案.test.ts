import { 適配分析體系, 音韻地位 } from "qieyun";

import type { 原始推導函數, 選項項目 } from "./types";
import 推導方案 from "./推導方案";

type MockOptions = Partial<{
  兼容模式: boolean;
  最簡描述: boolean;
  正則化: boolean;
}> &
  Record<string, unknown>;

function mock(選項?: MockOptions): 選項項目[];
function mock(選項: MockOptions, 地位: 音韻地位, ...rest: unknown[]): string;
function mock(選項: MockOptions = {}, 地位?: 音韻地位): 選項項目[] | string {
  if (!地位) {
    const params: 選項項目[] = [
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
  if (選項.正則化) {
    地位 = 適配分析體系.v2(地位);
  }
  return "d:" + (選項.最簡描述 ? 地位.最簡描述 : 地位.描述);
}

const mock方案 = new 推導方案(mock);

test("基礎使用", () => {
  expect(mock方案.推導()(音韻地位.from描述("幫凡入"))).toBe("d:幫三凡入");
  expect(mock方案()(音韻地位.from描述("幫凡入"))).toBe("d:幫三凡入");
});

test("推導函數.方案", () => {
  expect(mock方案.推導().方案).toBe(mock方案);
  expect(mock方案().方案).toBe(mock方案);
});

test("指定選項", () => {
  expect(mock方案({ 最簡描述: true })(音韻地位.from描述("幫凡入"))).toBe("d:幫凡入");
});

test("動態選項列表", () => {
  const 地位1 = 音韻地位.from描述("端開三麻平");
  const 地位2 = 音韻地位.from描述("昌咍上");

  expect(mock方案.方案選項().鍵值.get("正則化")).toBe(true); // strict comparison
  const 推導 = mock方案();
  expect(推導(地位1)).toBe("d:端開三麻平");
  expect(推導(地位2)).toBe("d:昌開三廢上");

  const 選項 = { 兼容模式: true };
  expect(mock方案.方案選項(選項).鍵值.has("正則化")).toBeFalsy();
  const 舊版推導 = mock方案(選項);
  expect(舊版推導(地位1)).toBe("d:知開三麻平");
  expect(舊版推導(地位2)).toBe("d:昌開一咍上");
});

test("動態指定 $legacy", () => {
  const 地位 = 音韻地位.from描述("幫清入");
  expect(mock方案()(地位)).toBe("d:幫三清入");
  expect(mock方案({ 兼容模式: false })(地位)).toBe("d:幫三清入");
  expect(mock方案({ 兼容模式: true })(地位)).toBe("d:幫三A清入");
});

test("不處理選項的方案", () => {
  const 方案 = new 推導方案(((_選項: unknown, 音韻地位: 音韻地位) => {
    if (音韻地位.屬於`效攝`) return "orz";
    return "sro";
  }) as unknown as 原始推導函數<string>);
  expect(() => 方案()).not.toThrow();
  expect(方案()(音韻地位.from描述("見豪平"))).toBe("orz");
});

test("無選項兼容模式方案", () => {
  const legacy方案 = new 推導方案(((_選項: unknown, 音韻地位: unknown) => {
    if (!音韻地位) return [["$legacy", true]];
    return "orz";
  }) as unknown as 原始推導函數<string>);
  expect(legacy方案.方案選項().兼容模式).toBe(true);
});
