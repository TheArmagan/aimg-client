import { Rest, RestOptions } from "./Rest";
import pkg from "../../package.json";
import { RestRenderSessionOptions, RestSessionInstance } from "./Rest/Sessions";
import { jsonHash } from "../utils";
import path from "path";
import fs from "fs";

export type AIMGClientOptions = {
  apiKey: string;
  rest?: RestOptions;
  templatesPath?: string;
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
    });
    this.options.templatesPath ||= path.join(process.cwd(), "templates");
  }

  async render(html: string, config: RestRenderSessionOptions["config"], sessionConfig: RestSessionInstance) {
    const sessionId = await this.freeSessionId(sessionConfig);
    if (!sessionId) throw new Error("Failed to get session id");

    const res = await this.rest.sessions.render({
      session_id: sessionId,
      html,
      config
    });

    const buffer = Buffer.from(await (await fetch(res.url)).arrayBuffer());

    return {
      buffer,
      filaname: res.filename,
      content_type: res.content_type as "image/png" | "image/gif",
      statistics: res.statistics
    };
  }

  async renderTemplate(name: string, data?: Record<string, any>) {
    const templateFolder = path.join(this.options.templatesPath!, name);
    if (!fs.existsSync(templateFolder)) throw new Error(`Template folder ${templateFolder} does not exist`);
    const templateFile = path.join(templateFolder, "template.aimg.html");
    if (!fs.existsSync(templateFile)) throw new Error(`Template file ${templateFile} does not exist`);
    const sessionFile = path.join(templateFolder, "session.aimg.json");
    if (!fs.existsSync(sessionFile)) throw new Error(`Session file ${sessionFile} does not exist`);

    const animationFile = path.join(templateFolder, "animation.aimg.json");
    const isAnimation = fs.existsSync(animationFile);

    const sessionConfig = JSON.parse(await fs.promises.readFile(sessionFile, "utf-8"));

    if (sessionConfig.type.includes("Animated") && !isAnimation)
      throw new Error(`Template ${name} is animated, but no animation file found.`);

    const html = await fs.promises.readFile(templateFile, "utf-8");
    const animation = isAnimation ? JSON.parse(await fs.promises.readFile(animationFile, "utf-8")) : undefined;

    const dataFile = path.join(templateFolder, "data.aimg.json");
    if (!data && !fs.existsSync(dataFile)) throw new Error(`Data file ${dataFile} does not exist`);
    if (!data) data = JSON.parse(await fs.promises.readFile(dataFile, "utf-8"));

    return await this.render(html, { data: data || {}, animation }, sessionConfig);
  }

  async freeSessionId(config: RestSessionInstance) {
    const instanceHash = jsonHash(config);
    let session = (await this.rest.sessions.list()).find((session) => !session.is_busy && session.instance_hash === instanceHash);
    if (session) return session.id;
    session = await this.rest.sessions.create({
      name: `AIMGClient-${instanceHash}`,
      instance: config
    });
    return session.id;
  }
}