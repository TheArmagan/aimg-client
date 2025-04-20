import crypto from "node:crypto";
import stringify from "fast-json-stable-stringify";

export function jsonHash(obj: any): string {
  return crypto.createHash('md5').update(stringify(obj)).digest('hex');
}