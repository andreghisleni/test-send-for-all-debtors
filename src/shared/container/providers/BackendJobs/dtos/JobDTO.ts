export interface IJobDTO {
  key: string;
  limiter?: {
    max: number;
    duration: number;
  };
  handle: any; // eslint-disable-line
}
