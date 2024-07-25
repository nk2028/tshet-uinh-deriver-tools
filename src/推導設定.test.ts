import { 推導設定 } from "./推導設定";

const EXAMPLE = [
  { key: "選項一", default: true },
  { key: "選項二", default: 42 },
  { type: "groupLabel", text: "標籤" },
  { key: "選項三", default: "orz", text: "選項名" },
  {
    key: "選項四",
    default: "好耶",
    options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }],
  },
] as const;

const EXAMPLE_INPUT = [
  { key: "選項一", default: true },
  { key: "選項二", default: 42 },
  { type: "groupLabel", text: "標籤" },
  { key: "選項三", default: "orz", text: "選項名" },
  {
    key: "選項四",
    default: 0,
    options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }],
  },
] as const;

const EXAMPLE_COMPACT_INPUT = [
  ["選項一", true],
  ["選項二", 42],
  "標籤",
  ["選項三|選項名", "orz"],
  ["選項四", [1, "好耶", { value: "壞耶", text: "噫（" }, 42]],
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

test("複製、調整預設值", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(設定.列表).toEqual(EXAMPLE);
  expect(設定.clone().列表).toEqual(EXAMPLE);
  expect(設定.setDefault("選項四", "壞耶").列表).toEqual([
    { key: "選項一", default: true },
    { key: "選項二", default: 42 },
    { type: "groupLabel", text: "標籤" },
    { key: "選項三", default: "orz", text: "選項名" },
    {
      key: "選項四",
      default: "壞耶",
      options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }],
    },
  ] as const);
  // `setDefault` does not alter the original object
  expect(設定.列表).toEqual(EXAMPLE);
});

test("JSON 格式", () => {
  const 設定 = new 推導設定(EXAMPLE);
  expect(JSON.stringify(設定)).toBe(JSON.stringify(EXAMPLE));
  expect(String(設定)).toBe(JSON.stringify(EXAMPLE));
});
