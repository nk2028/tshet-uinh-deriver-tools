declare global {
  interface ArrayConstructor {
    isArray(arg: unknown): arg is readonly unknown[];
  }
}

export {};
