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
  undefined, // 此項忽略
  { key: "選項二", value: 42 },
  { type: "groupLabel", text: "標籤", description: "分組說明" },
  { key: "選項三", value: "orz", text: "選項名", description: "選項說明\n第二行" },
  { type: "newline" },
  { key: "忽略", value: null },
  { key: "忽略", value: undefined }, // 忽略所以不算重複 key
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
  ["忽略", undefined],
  ["選項四", [1, "好耶", { value: "壞耶", text: "噫（" }, 42, null]],
] as const;

const EXAMPLE_INCORRECT = [["選項一", true], ["不正確項"], ["選項二", 42]] as const;
const EXAMPLE_INCORRECT_MSGS = ["item #1: not a valid tuple"] as const;

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

test("選單項（緊湊格式下標）", () => {
  const 設定 = new 推導設定([["param1", [2, 42, 43, 1]]]);
  expect(設定.列表).toHaveProperty(["0", "value"], 43);
});

test("忽略項與未忽略項重名", () => {
  const 設定 = new 推導設定([
    ["param1", true],
    ["param1", null],
  ]);
  expect(設定.解析錯誤).toEqual([]);
});

test("clone", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(設定.列表).toEqual(EXAMPLE);
  expect(設定.clone().列表).toEqual(EXAMPLE);

  const 不正確設定 = new 推導設定(EXAMPLE_INCORRECT);
  expect(不正確設定.解析錯誤).toEqual(EXAMPLE_INCORRECT_MSGS);
  const clone = 不正確設定.clone();
  expect(clone.列表).toEqual(不正確設定.列表);
  expect(clone.解析錯誤).toEqual(不正確設定.解析錯誤);
});

test("with, 選項", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(設定.with({ 選項一: false, 選項四: "壞耶" }).列表).toEqual(
    [
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
    ] as const,
  );
  expect(設定.with({ 選項四: "壞耶" }).選項).toEqual({
    選項一: true,
    選項二: 42,
    選項三: "orz",
    選項四: "壞耶",
  });
  expect(設定.with({}).列表).toEqual(EXAMPLE);
  expect(設定.with({ 選項一: undefined }).列表).toEqual(EXAMPLE);
  // `.with` does not alter the original object
  expect(設定.列表).toEqual(EXAMPLE);

  const 不正確設定 = new 推導設定(EXAMPLE_INCORRECT);
  const modified = 不正確設定.with({ 選項一: false });
  expect(modified.選項).toEqual({ 選項一: false, 選項二: 42 });
  expect(modified.解析錯誤).toEqual(不正確設定.解析錯誤);
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

test("值相等判斷", () => {
  const 設定 = new 推導設定([
    ["選項一", [NaN, 1, NaN, 2]],
    ["選項二", [-0, 1, 0, -0]],
  ]);
  expect(設定.解析錯誤).toEqual([]);
  expect(設定.列表[0]).toHaveProperty("value", NaN);
  expect(設定.列表[1]).toHaveProperty("value", -0);
});
