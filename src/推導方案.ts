import { 表達式, 適配分析體系, 音韻地位 } from "qieyun";

import type { 原始推導函數, 選項, 選項列表, 選項迭代 } from "./types";
import 推導選項 from "./推導選項";

const 適配poem = 適配分析體系("poem");

type 推導函數<T> = 推導方案<T>["推導"];

// @ts-expect-error ts(2420)
export default class 推導方案<T> implements 推導函數<T> {
  readonly isLegacy: boolean;
  readonly parameters: Readonly<選項列表>;
  readonly defaultOptions: Readonly<選項>;
  readonly optionsCount: number;

  constructor(
    private 原始推導函數: 原始推導函數<T>,
    選項列表: 選項迭代 = (() => {
      let parameters: 選項迭代;
      try {
        parameters = this.原始推導函數();
        if (typeof parameters[Symbol.iterator] !== "function") return [];
      } catch {
        return [];
      }
      return parameters;
    })()
  ) {
    const optionInstance = new 推導選項(選項列表);
    this.isLegacy = optionInstance.isLegacy;
    this.parameters = optionInstance.parameters;
    this.defaultOptions = optionInstance.defaultOptions;
    this.optionsCount = optionInstance.optionsCount;

    // FIXME `apply` works only with `Function`s
    return Object.freeze(
      new Proxy(this, {
        apply(target, ...args) {
          return Reflect.apply(Reflect.get(target, "推導"), ...args);
        },
      })
    ) as this;
  }

  推導(地位: 音韻地位, 字頭: string | null = null, 選項: Record<string, unknown> = {}, ...args: unknown[]) {
    if (!地位) throw new Error("expect 音韻地位");
    選項 = { ...this.defaultOptions, 選項 };
    地位 = 適配分析體系.v2extStrict(地位);
    if (this.isLegacy) {
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
