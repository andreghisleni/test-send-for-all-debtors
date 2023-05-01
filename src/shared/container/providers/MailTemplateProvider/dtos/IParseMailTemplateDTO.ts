interface ITemplateVariables {
  [key: string]: string | number | any;
}
export interface IParseMailTemplateDTO {
  file: string;
  variables: ITemplateVariables;
}
