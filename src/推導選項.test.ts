import 推導選項 from "./推導選項";

test("調整選項時保留兼容模式", () => {
  const 選項 = new 推導選項([
    ["$legacy", true],
    ["answer", 42],
  ]);
  expect(選項.兼容模式).toBe(true);
  expect(選項.clone().兼容模式).toBe(true);
  expect(選項.set("answer", 44).兼容模式).toBe(true);
});
