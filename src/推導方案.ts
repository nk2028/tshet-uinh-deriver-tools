import { 表達式, 適配分析體系, 音韻地位 } from "qieyun";

import type { 原始推導函數, 選項迭代 } from "./types";
import 推導選項 from "./推導選項";

const 適配poem = 適配分析體系("poem");

export type 推導函數<T> = {
  (地位: 音韻地位, 字頭?: string | null, ...args: unknown[]): T;
  readonly 方案: 推導方案<T>;
};

/**
 * 包裝了原始的推導方案代碼的對象，可以方便地從 JS 調用。
 */
// @ts-expect-error ts(2420)
export default class 推導方案<T> extends Function implements (推導方案<T>)["推導"] {
  constructor(readonly 原始推導函數: 原始推導函數<T>) {
    super();
    const proxy: this = new Proxy(this, {
      apply(_target, _thisArg, args: Parameters<推導方案<T>["推導"]>) {
        // NOTE Don't use `target.推導`,
        // because `this` in `推導` should refer to the proxied object, not the original.
        return proxy.推導(...args);
      },
    });
    return proxy;
  }

  /**
   * 返回方案提供的選項列表及各項預設值等。
   *
   * 一些方案還會依 `當前選項` 而條件性提供不同選項。
   */
  方案選項(當前選項: Record<string, unknown> = {}): 推導選項 {
    let parameters: 選項迭代 = [];
    try {
      const raw = this.原始推導函數(當前選項);
      if (typeof parameters[Symbol.iterator] === "function") {
        parameters = raw;
      }
    } finally { /* intentionally ignored */ }
    return new 推導選項(parameters);
  }

  /**
   * 以所給之 `選項` 建立推導函數。向返回的推導函數傳入 `音韻地位` 等即可實行推導。
   *
   * `選項` 中未指定的項目會被填入預設值。
   *
   * ```typescript
   * const from = Qieyun.音韻地位.from描述;
   *
   * const 方案 = new 推導方案(tupa原始推導函數);
   *
   * const 推導1 = 方案.推導(); // 使用預設選項
   * 推導1(from('並灰上'), '倍'); // => 'bojq'
   *
   * const 推導2 = 方案.推導({模式: '標準'}); // 指定推導選項，未指定項目均為預設值
   * 推導2(from('並咍上'), '倍'); // => 'bojq'
   *
   * 方案.推導({ 模式: '標準', 脣音咍韻歸灰韻: false })(地位, '倍'); // => 'beojq'
   * ```
   */
  推導(選項: Record<string, unknown> = {}): 推導函數<T> {
    const 方案選項 = this.方案選項(選項);
    const 實際選項 = { ...方案選項.預設選項, ...選項 };

    const derive = (地位: 音韻地位, 字頭: string | null = null, ...args: unknown[]): T => {
      if (!地位) throw new Error("expect 音韻地位");
      地位 = 適配分析體系.v2extStrict(地位);
      if (方案選項.兼容模式) {
        地位 = 適配poem(地位);
        地位.屬於`脣音 或 ${表達式.開合中立韻}` && (地位 = 地位.調整({ 呼: null }));
        地位.屬於`${表達式.重紐母} (${表達式.重紐韻} 或 清韻)` || (地位 = 地位.調整({ 重紐: null }));
      }
      try {
        return this.原始推導函數(實際選項, 地位, 字頭, ...args);
      } catch (err) {
        throw new Error(
          字頭
            ? `推導「${字頭}」字（音韻地位：${地位.描述}）時發生錯誤`
            : `推導「${地位.描述}」音韻地位（字為 null）時發生錯誤`,
          { cause: err as Error }
        );
      }
    };

    derive.方案 = this;

    return derive;
  }
}
