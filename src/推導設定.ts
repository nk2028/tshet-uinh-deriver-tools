export interface Option extends Readonly<Record<string, unknown>> {
  readonly value: unknown;
  readonly text?: string;
}
export interface Parameter extends Readonly<Record<string, unknown>> {
  readonly key: string;
  readonly value: unknown;
  readonly text?: string;
  readonly options?: Option[];
  readonly description?: string;
}
export interface Newline {
  readonly type: "newline";
}
export interface GroupLabel {
  readonly type: "groupLabel";
  readonly text: string;
  readonly description?: string;
}
export type 設定項 = Parameter | Newline | GroupLabel;

type Mutable<T> = {
  -readonly [x in keyof T]: T[x];
};
type ParameterMut = Mutable<Parameter>;
type GroupLabelMut = Mutable<GroupLabel>;

/** `Array.isArray`, but more conservative */
function isArray(obj: unknown): obj is readonly unknown[] {
  return Array.isArray(obj);
}

const patternDescSep = /[\n-\r\x85\u2028\u2029]+/u;

// TODO doc
export default class 推導設定 {
  readonly 列表: readonly 設定項[];
  readonly 選項: Readonly<Record<string, unknown>>;
  readonly 解析錯誤: readonly string[];

  constructor(設定列表: readonly unknown[]) {
    const 解析錯誤: string[] = [];
    const seenKeys = new Set<string>();
    this.列表 = 設定列表.flatMap((原始設定項, i): 設定項[] => {
      let valueIsIndex = false;
      if (isArray(原始設定項)) {
        // 以陣列格式指定的參數，轉換為物件格式
        if (原始設定項.length !== 2 && 原始設定項.length !== 3) {
          解析錯誤.push(`item #${i}: not a valid tuple`);
          return [];
        }
        const [rawKey, rawValue, rest = {}] = 原始設定項;
        if (!(typeof rest === "object" && rest !== null)) {
          解析錯誤.push(`item #${i}: not an object`);
          return [];
        }
        if (typeof rawKey !== "string") {
          解析錯誤.push(`item #${i}: key is not a string`);
          return [];
        }
        // NOTE Matching against the separator only, not using capturing groups.
        // This ensures that the string are split properly at the first occurrence of the separator.
        const descSep = patternDescSep.exec(rawKey);
        let key = rawKey;
        let description = "";
        if (descSep) {
          description = rawKey.slice(descSep.index + descSep[0].length);
          key = rawKey.slice(0, descSep.index);
        }
        const textSep = key.indexOf("|");
        let text = "";
        if (textSep !== -1) {
          text = key.slice(textSep + 1);
          key = key.slice(0, textSep);
        }

        let value = rawValue;
        let options = null;
        if (isArray(rawValue)) {
          if (rawValue.length < 2) {
            解析錯誤.push(`item #${i}: value is not a valid list`);
            return [];
          }
          value = rawValue[0];
          options = rawValue.slice(1);
          if (
            typeof value === "number" &&
            !options.some(
              x => Object.is(x, value) || (typeof x === "object" && x && "value" in x && Object.is(x.value, value)),
            )
          ) {
            value = value - 1;
            valueIsIndex = true;
          }
        }

        原始設定項 = { ...rest, key, value };
        if (text) {
          (原始設定項 as ParameterMut).text = text;
        }
        if (description) {
          (原始設定項 as ParameterMut).description = description;
        }
        if (options !== null) {
          ((原始設定項 as ParameterMut).options as unknown[]) = options;
        }
      }

      if (原始設定項 === undefined) {
        // 忽略此項，且不記入錯誤
        return [];
      } else if (原始設定項 === null || 原始設定項 === "") {
        return [{ type: "newline" }];
      } else if (typeof 原始設定項 === "string") {
        let text = 原始設定項;
        let description = "";
        const descSep = patternDescSep.exec(原始設定項);
        if (descSep) {
          description = 原始設定項.slice(descSep.index + descSep[0].length);
          text = 原始設定項.slice(0, descSep.index);
        }
        const item: GroupLabel = { type: "groupLabel", text: text };
        if (description) {
          (item as GroupLabelMut).description = description;
        }
        return [item];
      } else if (typeof 原始設定項 !== "object") {
        解析錯誤.push(`item #${i}: not an object`);
        return [];
      } else if ("key" in 原始設定項) {
        if (typeof 原始設定項.key !== "string") {
          解析錯誤.push(`item #${i}: key is not a string`);
          return [];
        }
        if (原始設定項.key === "") {
          解析錯誤.push(`item #${i}: empty key`);
          return [];
        }
        if (!("value" in 原始設定項)) {
          解析錯誤.push(`item #${i}: missing property 'value' for parameter`);
          return [];
        }
        const 設定項 = { ...原始設定項 };

        if ("options" in 設定項) {
          if (!isArray(設定項.options)) {
            解析錯誤.push(`item #${i}: property 'options' is not an array`);
            return [];
          }
          if (!設定項.options.length) {
            解析錯誤.push(`item #${i}: empty options`);
            return [];
          }
          const seenValues = new Set();
          const parsedOptions: Option[] = [];
          for (const [j, rawOption] of 設定項.options.entries()) {
            const option: object =
              typeof rawOption === "object" && rawOption !== null ? rawOption : { value: rawOption };
            if (!("value" in option)) {
              解析錯誤.push(`item #${i} option #${j}: missing value`);
              return [];
            }
            if (seenValues.has(option.value)) {
              解析錯誤.push(`item #${i} option #${j}: duplicate value: ${String(option.value)}`);
              return [];
            }
            parsedOptions.push({ ...option });
          }

          if (valueIsIndex || !parsedOptions.some(option => Object.is(option.value, 設定項.value))) {
            if (typeof 設定項.value === "number" && 0 <= 設定項.value && 設定項.value < parsedOptions.length) {
              設定項.value = parsedOptions[設定項.value]!.value;
            } else {
              解析錯誤.push(`item #${i}: value not in options`);
              return [];
            }
          }
          設定項.options = parsedOptions;
        } else {
          if (設定項.value == null) {
            // 忽略此項，且不記入錯誤
            return [];
          }
          if (!["string", "number", "boolean"].includes(typeof 設定項.value)) {
            解析錯誤.push(`item #${i}: unsupported value type: ${typeof 設定項.value}`);
            return [];
          }
        }

        if (seenKeys.has(原始設定項.key)) {
          解析錯誤.push(`item #${i}: duplicate key: ${原始設定項.key}`);
          return [];
        }
        seenKeys.add(原始設定項.key);
        return [設定項 as Parameter];
      } else if (!("type" in 原始設定項)) {
        解析錯誤.push(`item #${i}: missing type or key`);
        return [];
      } else if (原始設定項.type === "groupLabel") {
        if (!("text" in 原始設定項)) {
          解析錯誤.push(`item #${i}: missing property 'text' for item type 'groupLabel'`);
          return [];
        }
        if (typeof 原始設定項.text !== "string") {
          解析錯誤.push(`item #${i}: property 'text' is not a string`);
        }
        return [{ ...原始設定項 } as GroupLabel];
      } else if (原始設定項.type === "newline") {
        return [{ ...原始設定項 } as Newline];
      } else {
        解析錯誤.push(`item #${i}: unknown type: ${String(原始設定項.type)}`);
        return [];
      }
    });
    this.解析錯誤 = 解析錯誤;

    const 預設選項: Record<string, unknown> = {};
    for (const item of this.列表) {
      if ("key" in item) {
        預設選項[item.key] = item.value;
      }
    }
    this.選項 = 預設選項;
  }

  clone(): 推導設定 {
    const cloned = new 推導設定(this.列表);
    (cloned as unknown as { 解析錯誤: string[] }).解析錯誤 = [...this.解析錯誤];
    return cloned;
  }

  with(entries: Record<string, unknown>): 推導設定 {
    const newList = this.列表.map(item => {
      if ("key" in item && Object.prototype.hasOwnProperty.call(entries, item.key)) {
        const value = entries[item.key];
        if (value === undefined) {
          return item;
        }
        if (
          "options" in item &&
          !item.options.some(option => Object.is(option.value, value)) &&
          !(typeof value === "number" && value in item.options)
        ) {
          return item;
        }
        return { ...item, value };
      } else {
        return item;
      }
    });
    const modified = new 推導設定(newList);
    (modified as unknown as { 解析錯誤: string[] }).解析錯誤 = [...this.解析錯誤];
    return modified;
  }

  toJSON(): readonly 設定項[] {
    return this.列表;
  }

  toString() {
    return JSON.stringify(this);
  }
}
