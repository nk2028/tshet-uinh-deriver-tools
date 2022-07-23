import { 表達式, 適配分析體系, 音韻地位 } from "qieyun";

import type { 原始推導函數, 選項迭代 } from "./types";
import 推導選項 from "./推導選項";

const 適配poem = 適配分析體系("poem");

type 推導函數<T> = 推導方案<T>["推導"];

// @ts-expect-error ts(2420)
export default class 推導方案<T> extends Function implements 推導函數<T> {
  readonly 預設配置: 推導選項;

  constructor(readonly 原始推導函數: 原始推導函數<T>) {
    super();

    let parameters: 選項迭代 = [];
    try {
      const raw = this.原始推導函數();
      if (typeof parameters[Symbol.iterator] === "function") {
        parameters = raw;
      }
    } finally {
      // ignore errors in 原始推導函數
    }
    this.預設配置 = new 推導選項(parameters);

    return new Proxy(this, {
      apply(target, _thisArg, args: Parameters<推導函數<T>>) {
        return target.推導(...args);
      },
    });
  }

  推導(地位: 音韻地位, 字頭: string | null = null, 選項: Record<string, unknown> = {}, ...args: unknown[]) {
    if (!地位) throw new Error("expect 音韻地位");
    // TODO don't use `預設配置`, obtain a new parameter list & default options instead (same below)
    選項 = { ...this.預設配置.defaultOptions, 選項 };
    地位 = 適配分析體系.v2extStrict(地位);
    if (this.預設配置.isLegacy) {
      地位 = 適配poem(地位);
      地位.屬於`脣音 或 ${表達式.開合中立韻}` && (地位 = 地位.調整({ 呼: null }));
      地位.屬於`${表達式.重紐母} (${表達式.重紐韻} 或 清韻)` || (地位 = 地位.調整({ 重紐: null }));
    }
    try {
      return this.原始推導函數(地位, 字頭, 選項, ...args);
    } catch (err) {
      throw new Error(
        字頭
          ? `推導「${字頭}」字（音韻地位：${地位.描述}）時發生錯誤`
          : `推導「${地位.描述}」音韻地位（字為 null）時發生錯誤`,
        { cause: err as Error }
      );
    }
  }
}
