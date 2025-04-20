import { Rest } from ".";

export type RestSessionInstance = {
  type: 'NoScriptStatic' | 'NoScriptAnimated';
  profiles: (
    {
      name: "TailwindCSS",
      config?: any
    } | {
      name: "Unovis",
    } | {
      name: "GSAP",
      config: {
        customEases: {
          name: string;
          ease: string;
        }[]
      }
    }
  )[]
}

export type RestCreateSessionOptions = {
  name: string;
  instance: RestSessionInstance;
}

export type RestSession = {
  id: string;
  config: {
    owner_id: string;
    name: string;
    instance: RestSessionInstance;
  };
  last_activity_at: number;
  created_at: number;
  is_busy: boolean;
  server_url: string;
}

export type RestRenderSessionOptions = {
  sesion_id: string;
  html: string;
  config: {
    data: Record<string, any>;
    animation?: {
      frames?: number;
      frameRate?: number;
      loop?: boolean;
      list: {
        from: Record<string, any>;
        to: Record<string, any>;
        delay?: number;
        ease?: string;
        updaters: {
          value?: {
            $$: string
          };
          setters: {
            type: 'Style' | 'Attribute' | 'Text' | 'Html' | 'Unovis:Components' | 'Unovis:Container' | 'Unovis:Data';
            selector: string;
            key?: string;
            value: any;
            condition?: {
              $$: string;
            } | boolean;
          }[]
        }[]
      }[]
    }
  }
}

export type RestRenderSessionResponse = {
  id: string;
  filename: string;
  url: string;
  content_type: string;
  statistics: any;
}

export type RestDestroySessionOptions = {
  session_id: string;
}

export class RestSessions {
  constructor(public rest: Rest) { }

  async create(options: RestCreateSessionOptions): Promise<RestSession> {
    const res = await this.rest.fetch({
      url: '/sessions/create',
      method: 'POST',
      responseType: 'JSON',
      body: JSON.stringify(options)
    });
    if (res.data.error) throw new Error(`Failed to create session: ${res.data.error.code}`, { cause: res.data.error });
    return res.data.content as RestSession;
  }

  async list(): Promise<RestSession[]> {
    const res = await this.rest.fetch({
      url: '/sessions/list',
      method: 'GET',
      responseType: 'JSON'
    });
    if (res.data.error) throw new Error(`Failed to list sessions: ${res.data.error.code}`, { cause: res.data.error });
    return res.data.content as RestSession[];
  }

  async render(options: RestRenderSessionOptions): Promise<RestRenderSessionResponse> {
    const res = await this.rest.fetch({
      url: '/sessions/render',
      method: 'POST',
      responseType: 'JSON',
      body: JSON.stringify(options)
    });
    if (res.data.error) throw new Error(`Failed to render session: ${res.data.error.code} (${res.data.error.content})`, { cause: res.data.error });
    return res.data.content as RestRenderSessionResponse;
  }

  async destroy(options: RestDestroySessionOptions): Promise<boolean> {
    const res = await this.rest.fetch({
      url: '/sessions/destroy',
      method: 'POST',
      responseType: 'JSON',
      body: JSON.stringify(options)
    });
    if (res.data.error) throw new Error(`Failed to destroy session: ${res.data.error.code}`, { cause: res.data.error });
    return res.data.ok;
  }
}