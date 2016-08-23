declare module 'prismjs' {
  declare type Definition = {
    [key: string]: any
  };

  declare var languages: {
    [language: string]: Definition
  };

  declare type Token = {
    type: string,
    content: string | Token[]
  };

  declare function tokenize(code: string, definition: Definition): Array<Token>;
}
