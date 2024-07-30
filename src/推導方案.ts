import type { 音韻地位 } from "qieyun";

import 推導設定 from "./推導設定";

export type 選項 = Record<string, unknown>;

export interface 原始推導函數<T> {
  (選項?: 選項): unknown[];
  (選項: 選項, 地位: 音韻地位, 字頭: string | null, ...rest: unknown[]): T;
}

export interface 推導函數<T> {
  (地位: 音韻地位, 字頭?: string | null, ...args: unknown[]): T;
  readonly 方案: 推導方案<T>;
}

export default interface 推導方案<T> {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (...args: Parameters<推導方案<T>["推導"]>): ReturnType<推導方案<T>["推導"]>;
}

/**
 * 包裝了原始的推導方案代碼的對象，可以方便地從 JS 調用。
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export default class 推導方案<T> extends Function {
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
   * 返回方案提供的設定項列表。
   *
   * 一些方案還會依 `當前選項` 而條件性提供不同設定項。
   */
  方案設定(當前選項: Record<string, unknown> = {}): 推導設定 {
    let settings: unknown[] = [];
    try {
      const raw = this.原始推導函數(當前選項);
      if (Array.isArray(raw)) {
        settings = raw;
      }
    } catch {
      /* intentionally ignored */
    }
    return new 推導設定(settings);
  }

  /**
   * 以所給之 `選項` 建立推導函數。向返回的推導函數傳入 `音韻地位` 等即可實行推導。
   *
   * `選項` 中未指定的項目會被填入預設值。
   *
   * 【提示】`推導方案` 對象也可以直接調用，效果等同於 `.推導`。
   *
   * ```typescript
   * const from = Qieyun.音韻地位.from描述;
   *
   * const 方案 = new 推導方案(舊版TUPA原始推導函數);
   *
   * const 推導1 = 方案(); // 使用預設選項；寫 `方案(...)` 或 `方案.推導(...)` 效果相同
   * 推導1(from('並灰上'), '倍'); // => 'bojq'
   *
   * const 推導2 = 方案({模式: '標準'}); // 指定推導選項，未指定項目均為預設值
   * 推導2(from('並咍上'), '倍'); // => 'bojq'
   *
   * 方案({ 模式: '標準', 脣音咍韻歸灰韻: false })(地位, '倍'); // => 'beojq'
   * ```
   */
  推導(選項: Record<string, unknown> = {}): 推導函數<T> {
    const 方案設定 = this.方案設定(選項);
    const 實際選項 = { ...方案設定.預設選項, ...選項 };

    const derive = (地位: 音韻地位, 字頭: string | null = null, ...args: unknown[]): T => {
      if (!地位) throw new Error("expect 音韻地位");
      try {
        return this.原始推導函數(實際選項, 地位, 字頭, ...args);
      } catch (err) {
        const newErr = new Error(
          字頭
            ? `推導「${字頭}」字（音韻地位：${地位.描述}）時發生錯誤`
            : `推導「${地位.描述}」音韻地位（字為 null）時發生錯誤`,
        );
        // NOTE ES2022 feature
        (newErr as unknown as { cause: unknown }).cause = err;
        throw newErr;
      }
    };

    derive.方案 = this;

    return derive;
  }
}
