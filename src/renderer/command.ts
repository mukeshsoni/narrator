export interface Command {
  name: string;
  command: string;
  target: Array<[string, string]>;
  // target: string;
  selectedTarget: number;
  value?: string;
  ignore?: boolean;
  coordinates?: string;
  href?: string;
  keyCode?: number;
}
