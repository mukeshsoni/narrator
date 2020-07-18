export interface Command {
  name: string;
  command: string;
  target: string;
  targets: Array<[string, string]>;
  value?: any;
  values?: Array<[string, string]>;
  coordinates?: string;
  keyCode?: number;
}

export interface TestConfig {
  url: string;
  commands: Array<Command>;
}
