import type { 參數映射, 選項, 選項列表, 選項迭代, 選項項目 } from "./types";

// `Array.isArray`, but with more conservative type inference
const isArray: (x: unknown) => x is readonly unknown[] = Array.isArray;

function setParametersMap(parametersMap: 參數映射, key: string, value: unknown) {
  key = String(key);
  const currentValue = parametersMap.get(key);
  if (typeof currentValue !== "undefined") {
    if (isArray(currentValue)) {
      if (currentValue.includes(value, 1)) {
        const cloned = [...currentValue] as [unknown, unknown, ...unknown[]];
        cloned[0] = value;
        parametersMap.set(key, cloned);
      }
    } else if (typeof value === typeof currentValue) parametersMap.set(key, value as typeof currentValue);
  }
  return parametersMap;
}

function parametersMapToArray(parametersMap: 參數映射): 選項項目[] {
  return Array.from(parametersMap, ([key, value]) => (typeof key === "string" ? [key, value] : (value as string)));
}

export default class 推導選項 {
  readonly isLegacy: boolean = false;
  readonly parameters: Readonly<選項列表>;
  readonly parametersMap: 參數映射 = new Map();
  readonly defaultOptions: Readonly<選項>;
  readonly optionsCount = 0;

  constructor(選項列表: 選項迭代 = []) {
    const parameters: 選項列表 = [];
    const defaultOptions: 選項 = {};

    for (const parameter of 選項列表) {
      if (!isArray(parameter)) {
        const text = String(parameter || "");
        parameters.push(text);
        this.parametersMap.set(Symbol(), text);
        continue;
      }
      const key = String(parameter[0]);
      const value = parameter[1];
      if (key === "$legacy") {
        this.isLegacy = !!value;
        continue;
      }
      if (["string", "number", "boolean"].includes(typeof value)) {
        defaultOptions[key] = value;
        parameters.push([key, value]);
        this.parametersMap.set(key, value);
        this.optionsCount++;
      } else if (isArray(value) && value.length > 1) {
        let [defaultValue] = value;
        if (
          typeof defaultValue === "number" &&
          Number.isInteger(defaultValue) &&
          defaultValue >= 1 &&
          defaultValue < value.length
        )
          defaultValue = value[defaultValue];
        else if (!value.includes(defaultValue, 1)) defaultValue = value[1];
        const cloned = [...value] as [unknown, unknown, ...unknown[]];
        defaultOptions[key] = cloned[0] = defaultValue;
        parameters.push([key, cloned]);
        this.parametersMap.set(key, cloned);
        this.optionsCount++;
      }
    }

    this.parameters = parameters;
    this.defaultOptions = defaultOptions;
    return Object.freeze(this);
  }

  get(key: string) {
    return this.defaultOptions[key];
  }

  set(key: string, value: unknown) {
    return new 推導選項(parametersMapToArray(setParametersMap(new Map(this.parametersMap), key, value)));
  }

  combine(old: 推導選項 | 選項) {
    const parametersMap = new Map(this.parametersMap);
    for (const parameter of Object.entries(old instanceof 推導選項 ? old.defaultOptions : old))
      setParametersMap(parametersMap, ...parameter);
    return new 推導選項(parametersMapToArray(parametersMap));
  }

  clone() {
    return new 推導選項(parametersMapToArray(this.parametersMap));
  }

  toJSON() {
    return this.defaultOptions;
  }

  toString() {
    return JSON.stringify(this);
  }
}
