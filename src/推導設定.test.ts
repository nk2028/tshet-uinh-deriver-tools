import 推導設定 from "./推導設定";

const EXAMPLE = [
  { key: "選項一", value: true },
  { key: "選項二", value: 42 },
  { type: "groupLabel", text: "標籤", description: "分組說明" },
  { key: "選項三", value: "orz", text: "選項名", description: "選項說明\n第二行" },
  { type: "newline" },
  {
    key: "選項四",
    value: "好耶",
    options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }, { value: null }],
  },
] as const;

const EXAMPLE_INPUT = [
  { key: "選項一", value: true },
  { key: "選項二", value: 42 },
  { type: "groupLabel", text: "標籤", description: "分組說明" },
  { key: "選項三", value: "orz", text: "選項名", description: "選項說明\n第二行" },
  { type: "newline" },
  { key: "忽略", value: null },
  {
    key: "選項四",
    value: 0,
    options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }, { value: null }],
  },
] as const;

const EXAMPLE_COMPACT_INPUT = [
  ["選項一", true],
  ["選項二", 42],
  "標籤\n分組說明",
  ["選項三|選項名\n選項說明\n第二行", "orz"],
  "",
  ["忽略", null],
  ["選項四", [1, "好耶", { value: "壞耶", text: "噫（" }, 42, null]],
] as const;

test("建立設定（基本形式）", () => {
  const 設定 = new 推導設定(EXAMPLE_INPUT);
  expect(設定.解析錯誤).toEqual([]);
  expect(設定.列表).toEqual(EXAMPLE);
});

test("建立設定（簡略形式）", () => {
  const 設定 = new 推導設定(EXAMPLE_COMPACT_INPUT);
  expect(設定.解析錯誤).toEqual([]);
  expect(設定.列表).toEqual(EXAMPLE);
});

test("clone, set, 選項", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(設定.列表).toEqual(EXAMPLE);
  expect(設定.clone().列表).toEqual(EXAMPLE);
  expect(設定.set("選項四", "壞耶").列表).toEqual([
    { key: "選項一", value: true },
    { key: "選項二", value: 42 },
    { type: "groupLabel", text: "標籤", description: "分組說明" },
    { key: "選項三", value: "orz", text: "選項名", description: "選項說明\n第二行" },
    { type: "newline" },
    {
      key: "選項四",
      value: "壞耶",
      options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }, { value: null }],
    },
  ] as const);
  expect(設定.set("選項四", "壞耶").選項).toEqual({
    選項一: true,
    選項二: 42,
    選項三: "orz",
    選項四: "壞耶",
  });
  // `.set` does not alter the original object
  expect(設定.列表).toEqual(EXAMPLE);
});

test("with", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(設定.with({ 選項一: false, 選項四: "壞耶" }).列表).toEqual([
    { key: "選項一", value: false },
    { key: "選項二", value: 42 },
    { type: "groupLabel", text: "標籤", description: "分組說明" },
    { key: "選項三", value: "orz", text: "選項名", description: "選項說明\n第二行" },
    { type: "newline" },
    {
      key: "選項四",
      value: "壞耶",
      options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }, { value: null }],
    },
  ] as const);
  expect(設定.with({}).列表).toEqual(EXAMPLE);
  expect(設定.with({ 選項一: undefined }).列表).toEqual(EXAMPLE);
  // `.with` does not alter the original object
  expect(設定.列表).toEqual(EXAMPLE);
});

test("with 與選單參數", () => {
  const 設定 = new 推導設定(EXAMPLE);
  const 修改後 = 設定.with({ 選項四: "不存在項" });
  expect(修改後.解析錯誤).toEqual([]);
  expect(修改後.列表).toEqual(EXAMPLE);
});

test("JSON 格式", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(JSON.stringify(設定)).toBe(JSON.stringify(EXAMPLE));
  expect(String(設定)).toBe(JSON.stringify(EXAMPLE));
});
