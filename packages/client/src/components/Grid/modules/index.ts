import { ClientSideRowModelModule } from 'components/Grid/modules/clientSideRowModel'
import { InfiniteRowModelModule } from 'components/Grid/modules/infiniteRowModel'
import { CsvExportModule } from 'components/Grid/modules/csvExport'
import { ClipboardModule } from "components/Grid/modules/clipboard";
import { ColumnsToolPanelModule } from "components/Grid/modules/columnToolPanel";
import { ExcelExportModule } from "components/Grid/modules/excelExport";
import { FiltersToolPanelModule } from "components/Grid/modules/filterToolPanel";
import { GridChartsModule } from "components/Grid/charts";
import { MasterDetailModule } from "components/Grid/modules/masterDetail";
import { MenuModule } from "components/Grid/modules/menu";
import { MultiFilterModule } from "components/Grid/modules/multiFilter";
import { RangeSelectionModule } from "components/Grid/modules/rangeSelection";
import { RichSelectModule } from "components/Grid/modules/richSelect";
import { RowGroupingModule } from "components/Grid/modules/rowGrouping";
import { ServerSideRowModelModule } from "components/Grid/modules/serverSideRowModel";
import { SetFilterModule } from "components/Grid/modules/setFilter";
import { SideBarModule } from "components/Grid/modules/sideBar";
import { StatusBarModule } from "components/Grid/modules/statusBar";
import { ViewportRowModelModule } from "components/Grid/modules/viewportRowModel";
import { SparklinesModule } from "components/Grid/modules/sparkLines";
import { Module } from '../core/ts/interfaces/iModule';

export * from "components/Grid/modules/clipboard";
export * from "components/Grid/modules/columnToolPanel";
export * from "components/Grid/modules/excelExport";
export * from "components/Grid/modules/filterToolPanel";
export * from "components/Grid/charts";
export * from "components/Grid/modules/masterDetail";
export * from "components/Grid/modules/menu";
export * from "components/Grid/modules/multiFilter";
export * from "components/Grid/modules/rangeSelection";
export * from "components/Grid/modules/richSelect";
export * from "components/Grid/modules/rowGrouping";
export * from "components/Grid/modules/serverSideRowModel";
export * from "components/Grid/modules/setFilter";
export * from "components/Grid/modules/sideBar";
export * from "components/Grid/modules/statusBar";
export * from "components/Grid/modules/viewportRowModel";
export * from "components/Grid/modules/sparkLines";

export const AllCommunityModules: Module[] = [ClientSideRowModelModule, InfiniteRowModelModule, CsvExportModule];

export * from "components/Grid/modules/clientSideRowModel";
export * from "components/Grid/modules/csvExport";
export * from "components/Grid/modules/infiniteRowModel";

export const AllEnterpriseModules: Module[] = [
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridChartsModule,
  MasterDetailModule,
  MenuModule,
  MultiFilterModule,
  RangeSelectionModule,
  RichSelectModule,
  RowGroupingModule,
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
  ViewportRowModelModule,
  SparklinesModule
];

export const AllModules: Module[] = AllCommunityModules.concat(AllEnterpriseModules);