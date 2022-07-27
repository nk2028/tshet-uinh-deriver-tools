import type { 音韻地位 } from "qieyun";

export type 參數 = string | number | boolean | readonly [unknown, unknown, ...unknown[]];
export type 參數項目 = readonly [key: string, value: 參數];
export type 參數映射 = Map<string | symbol, 參數>;
export type 選項項目 = string | null | undefined | 參數項目;
export type 選項列表 = 選項項目[];
export type 選項迭代 = Iterable<Readonly<選項項目>>;
export type 選項 = Record<string, unknown>;

export type 原始推導函數<T> = {
  (選項?: 選項): Iterable<選項項目>;
  (選項: 選項, 地位: 音韻地位, 字頭: string | null, ...rest: unknown[]): T;
};
