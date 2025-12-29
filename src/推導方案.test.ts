import { 音韻地位 } from "tshet-uinh";

import 推導方案 from "./推導方案";

import type { 原始推導函數 } from "./推導方案";

type MockOptions = Partial<{
  前綴: string;
  高級選項: boolean;
  簡略描述: boolean;
}> &
  Record<string, unknown>;

function mock(選項?: MockOptions): unknown[];
function mock(選項: MockOptions, 地位: 音韻地位): string;
function mock(選項: MockOptions = {}, 地位?: 音韻地位): unknown[] | string {
  if (!地位) {
    const params: unknown[] = [
      ["前綴", "d"],
      ["高級選項", false],
    ];
    if (選項.高級選項) {
      params.push(["簡略描述", true]);
    }
    return params;
  }
  return 選項.前綴! + ":" + (選項.簡略描述 ? 地位.簡略描述 : 地位.描述);
}

const mock方案 = new 推導方案(mock);

test("基礎使用", () => {
  expect(mock方案.推導()(音韻地位.from描述("幫三C凡入"))).toBe("d:幫三C凡入");
  expect(mock方案()(音韻地位.from描述("幫三C凡入"))).toBe("d:幫三C凡入");
});

test("推導函數.方案", () => {
  expect(mock方案.推導().方案).toBe(mock方案);
  expect(mock方案().方案).toBe(mock方案);
});

test("指定選項", () => {
  expect(mock方案({ 前綴: "D" })(音韻地位.from描述("幫三C凡入"))).toBe("D:幫三C凡入");
});

test("動態選項列表", () => {
  const 地位 = 音韻地位.from描述("幫三C凡入");

  expect(mock方案.方案設定().列表.some(item => "key" in item && item.key === "簡略描述")).toBeFalsy();
  const 推導 = mock方案();
  expect(推導(地位)).toBe("d:幫三C凡入");

  const 選項 = { 高級選項: true };
  expect(mock方案.方案設定(選項).列表.some(item => "key" in item && item.key === "簡略描述")).toBeTruthy();
  const 推導簡略描述 = mock方案(選項);
  expect(推導簡略描述(地位)).toBe("d:幫凡入");
});

test("不處理選項的方案", () => {
  const 方案 = new 推導方案(((_選項: unknown, 音韻地位: 音韻地位) => {
    if (音韻地位.屬於`效攝`) return "orz";
    return "sro";
  }) as unknown as 原始推導函數<string>);
  expect(() => 方案()).not.toThrow();
  expect(方案()(音韻地位.from描述("見開一豪平"))).toBe("orz");
});
