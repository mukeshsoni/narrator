export interface Command {
  name: string;
  command: string;
  target: string;
  targets: Array<[string, string]>;
  value?: any;
  values?: Array<[string, string]>;
  ignore?: boolean;
  coordinates?: string;
  keyCode?: number;
}
