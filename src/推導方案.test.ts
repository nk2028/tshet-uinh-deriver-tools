import { 音韻地位 } from "qieyun";

import type { 選項項目 } from "./types";
import 推導方案 from "./推導方案";

function mock(): 選項項目[];
function mock(地位: 音韻地位, ...rest: unknown[]): string;
function mock(地位?: 音韻地位): 選項項目[] | string {
  if (!地位) return [];
  return 地位.描述;
}

test("it works", () => {
  const schema = new 推導方案(mock);
  expect(schema(音韻地位.from描述("幫凡入"))).toBe("幫三凡入");
});
