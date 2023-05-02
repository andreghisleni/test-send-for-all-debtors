interface ITemplateVariables {
  [key: string]: string | number | any;
}
interface IParseMailVariablesDTO {
  variables: ITemplateVariables;
}
export interface IParseMailFileDTO extends IParseMailVariablesDTO {
  file: string;
}
export interface IParseMailHtmlDTO extends IParseMailVariablesDTO {
  html: string;
}

export type IParseMailTemplateDTO = IParseMailFileDTO | IParseMailHtmlDTO;
