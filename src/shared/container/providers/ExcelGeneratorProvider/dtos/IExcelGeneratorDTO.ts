interface IData {
  [key: string]: string | number;
}
interface ISheet {
  name: string;
  data: IData[];
}
export interface IExcelGeneratorDTO {
  fileName: string;
  sheets: ISheet[];
}
