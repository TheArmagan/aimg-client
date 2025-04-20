import { Rest, RestOptions } from "./Rest";
import pkg from "../../package.json";

export type AIMGClientOptions = {
  apiKey: string;
  rest?: RestOptions;
};

export class AIMGClient {
  public rest: Rest;
  constructor(public options: AIMGClientOptions) {
    this.rest = new Rest({
      baseUrl: "https://api.aimg.tr/v1",
      timeout: options.rest?.timeout || 20000,
      headers: {
        Authorization: options.apiKey,
        "Content-Type": "application/json",
        "User-Agent": `AIMGClient/${pkg.version}`,
        ...(options.rest?.headers || {}),
      },
    })
  }
}