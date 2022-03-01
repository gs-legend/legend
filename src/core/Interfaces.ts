export interface IVerbProperties {
  startRecord: number;
  endRecord: number;
  pageSize: number;
  totalRecords: number;
}

export interface IRuntimeInput {
  id: string;
  searchKey: string;
}