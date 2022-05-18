export interface Request {
    type: string,
    api: string,
    parameters: string[],
    fields: any,
    root?: string
  }