declare module 'fast-xml-parser' {
  export class XMLParser {
    constructor(options?: Record<string, unknown>)
    parse(xmlData: string): unknown
  }
}
