import { 推導設定 } from "./推導設定";

test("建立設定（基本形式）", () => {
  const 設定 = new 推導設定([
    { key: "選項一", default: true },
    { key: "選項二", default: 42 },
    { type: "groupLabel", text: "標籤" },
    { key: "選項三", default: "orz", text: "選項名" },
    {
      key: "選項四",
      default: 0,
      options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }],
    },
  ] as const);
  expect(設定.解析錯誤).toEqual([]);
  expect(設定.列表).toEqual([
    { key: "選項一", default: true },
    { key: "選項二", default: 42 },
    { type: "groupLabel", text: "標籤" },
    { key: "選項三", default: "orz", text: "選項名" },
    {
      key: "選項四",
      default: "好耶",
      options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }],
    },
  ] as const);
});

test("建立設定（簡略形式）", () => {
  const 設定 = new 推導設定([
    ["選項一", true],
    ["選項二", 42],
    "標籤",
    ["選項三|選項名", "orz"],
    ["選項四", [1, "好耶", { value: "壞耶", text: "噫（" }, 42]],
  ] as const);
  expect(設定.解析錯誤).toEqual([]);
  expect(設定.列表).toEqual([
    { key: "選項一", default: true },
    { key: "選項二", default: 42 },
    { type: "groupLabel", text: "標籤" },
    { key: "選項三", default: "orz", text: "選項名" },
    {
      key: "選項四",
      default: "好耶",
      options: [{ value: "好耶" }, { value: "壞耶", text: "噫（" }, { value: 42 }],
    },
  ] as const);
});
