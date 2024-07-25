export interface Parameter {
  key: string;
  default: unknown;
  text?: string;
  options?: unknown[];
}
export interface Newline {
  type: "newline";
}
export interface GroupLabel {
  type: "groupLabel";
  text: string;
}
export type 設定項 = Parameter | Newline | GroupLabel;

/** `Array.isArray`, but more conservative */
function isArray(obj: unknown): obj is readonly unknown[] {
  return Array.isArray(obj);
}

export class 推導設定 {
  readonly 列表: readonly 設定項[];
  readonly 解析錯誤: readonly string[];
  constructor(設定列表: readonly unknown[]) {
    const 解析錯誤: string[] = [];
    const seenKeys = new Set<string>();
    this.列表 = 設定列表.flatMap((原始設定項, i): 設定項[] => {
      if (typeof 原始設定項 !== "object") {
        解析錯誤.push(`error in item #${i}: unrecognized value`);
        return [];
      }
      if (原始設定項 === null) {
        return [{ type: "newline" }];
      } else if ("key" in 原始設定項) {
        if (typeof 原始設定項.key !== "string") {
          解析錯誤.push(`error in item #${i}: 'key' is not a string`);
          return [];
        }
        if (seenKeys.has(原始設定項.key)) {
          解析錯誤.push(`error in item #${i}: duplicate key: ${原始設定項.key}`);
          return [];
        }
        seenKeys.add(原始設定項.key);
        if (!("default" in 原始設定項)) {
          解析錯誤.push(`error in item #${i}: missing 'default' for parameter`);
          return [];
        }
        const 設定項 = { ...原始設定項 };
        if ("options" in 設定項) {
          if (!isArray(設定項.options)) {
            解析錯誤.push(`error in item #${i}: invalid 'options'`);
            return [];
          }
          if (!設定項.options.length) {
            解析錯誤.push(`error in item #${i}: empty 'options'`);
            return [];
          }
          const seenValues = new Set();
          const parsedOptions: { value: unknown }[] = [];
          for (const [j, option] of 設定項.options.entries()) {
            if (typeof option !== "object" || option === null) {
              解析錯誤.push(`error in item #${i} option #${j}: unrecognized value`);
              return [];
            } else if (!("value" in option)) {
              解析錯誤.push(`error in item #${i} option #${j}: missing 'value'`);
              return [];
            }
            if (seenValues.has(option.value)) {
              解析錯誤.push(`error in item #${i} option #${j}: duplicate value: ${option.value}`);
              return [];
            }
            parsedOptions.push({ ...option });
          }

          if (!parsedOptions.some(option => option.value === 設定項.default)) {
            if (typeof 設定項.default === "number" && 0 <= 設定項.default && 設定項.default < parsedOptions.length) {
              設定項.default = parsedOptions[設定項.default]!.value;
            } else {
              解析錯誤.push(`error in item #${i}: unknown default value`);
              return [];
            }
          }
          設定項.options = parsedOptions;
        }
        return [設定項 as Parameter];
      } else if (!("type" in 原始設定項)) {
        解析錯誤.push(`error in item #${i}: missing 'type'`);
        return [];
      } else if (原始設定項.type === "groupLabel") {
        if (!("text" in 原始設定項)) {
          解析錯誤.push(`error in item #${i}: missing 'text' for item type 'groupLabel'`);
          return [];
        }
        if (typeof 原始設定項.text !== "string") {
          解析錯誤.push(`error in item #${i}: 'text' is not a string`);
        }
        return [{ ...原始設定項 } as GroupLabel];
      } else if (原始設定項.type === "newline") {
        return [{ ...原始設定項 } as Newline];
      } else {
        解析錯誤.push(`error in item #${i}: unknown type: ${原始設定項.type}`);
        return [];
      }
    });
    this.解析錯誤 = 解析錯誤;
  }
}
