declare module 'espree' {
  export interface ParseOptions {
    ecmaVersion?: number | 'latest';
    sourceType?: 'script' | 'module';
    ecmaFeatures?: {
      jsx?: boolean;
      globalReturn?: boolean;
      impliedStrict?: boolean;
    };
    range?: boolean;
    loc?: boolean;
    tokens?: boolean;
    comment?: boolean;
  }

  export interface Program {
    type: 'Program';
    body: Array<{
      type: string;
      expression?: unknown;
      [key: string]: unknown;
    }>;
    sourceType: 'script' | 'module';
    [key: string]: unknown;
  }

  export function parse(code: string, options?: ParseOptions): Program;
}
