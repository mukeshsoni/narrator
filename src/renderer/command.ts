export interface Command {
  name: string;
  command: string;
  target: string;
  targets: Array<[string, string]>;
  value?: string;
  ignore?: boolean;
  coordinates?: string;
  keyCode?: number;
}
