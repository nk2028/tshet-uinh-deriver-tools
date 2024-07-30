export interface Parameter extends Readonly<Record<string, unknown>> {
  readonly key: string;
  readonly value: unknown;
  readonly text?: string;
  readonly options?: unknown[];
}
export interface Newline {
  readonly type: "newline";
}
export interface GroupLabel {
  readonly type: "groupLabel";
  readonly text: string;
}
export type 設定項 = Parameter | Newline | GroupLabel;

type ParameterMut = {
  -readonly [x in keyof Parameter]: Parameter[x];
}

/** `Array.isArray`, but more conservative */
function isArray(obj: unknown): obj is readonly unknown[] {
  return Array.isArray(obj);
}

// TODO doc
export default class 推導設定 {
  readonly 列表: readonly 設定項[];
  readonly 選項: Readonly<Record<string, unknown>>;
  readonly 解析錯誤: readonly string[];

  constructor(設定列表: readonly unknown[]) {
    const 解析錯誤: string[] = [];
    const seenKeys = new Set<string>();
    this.列表 = 設定列表.flatMap((原始設定項, i): 設定項[] => {
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
        const sep = rawKey.indexOf("|");
        let key = rawKey;
        let text = "";
        if (sep !== -1) {
          key = rawKey.slice(0, sep);
          text = rawKey.slice(sep + 1);
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
            !options.some(x => x === value || (x as { value?: unknown })?.value === value)
          ) {
            value = value - 1;
          }
        }

        原始設定項 = { ...rest, key, value };
        if (text) {
          (原始設定項 as ParameterMut).text = text;
        }
        if (options !== null) {
          (原始設定項 as ParameterMut).options = options;
        }
      }

      if (原始設定項 === null || 原始設定項 === "") {
        return [{ type: "newline" }];
      } else if (typeof 原始設定項 === "string") {
        return [{ type: "groupLabel", text: 原始設定項 }];
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
        if (seenKeys.has(原始設定項.key)) {
          解析錯誤.push(`item #${i}: duplicate key: ${原始設定項.key}`);
          return [];
        }
        seenKeys.add(原始設定項.key);
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
          const parsedOptions: { value: unknown }[] = [];
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

          if (!parsedOptions.some(option => option.value === 設定項.value)) {
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

        return [設定項 as Parameter];
      } else if (!("type" in 原始設定項)) {
        解析錯誤.push(`item #${i}: missing type`);
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
    return new 推導設定(this.列表);
  }

  set(key: string, value: unknown): 推導設定 {
    let found = false;
    const newList = this.列表.map(item => {
      if ("key" in item && item.key === key) {
        found = true;
        return { ...item, value: value };
      } else {
        return item;
      }
    });
    if (!found) {
      throw new Error(`key not found: ${JSON.stringify(key)}`);
    }
    return new 推導設定(newList);
  }

  toJSON(): readonly 設定項[] {
    return this.列表;
  }

  toString() {
    return JSON.stringify(this);
  }
}
