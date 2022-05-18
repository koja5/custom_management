export interface Request {
    type: string,
    api: string,
    parametars: string[],
    fields: any,
    root?: string
  }