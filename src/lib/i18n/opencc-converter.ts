import { Converter } from "opencc-js";

let convertFn: ((text: string) => string) | null = null;

/** Source content is always authored in zh-Hant — this is a one-way conversion. */
export function toSimplified(text: string): string {
  if (!convertFn) {
    convertFn = Converter({ from: "tw", to: "cn" });
  }
  return convertFn(text);
}
