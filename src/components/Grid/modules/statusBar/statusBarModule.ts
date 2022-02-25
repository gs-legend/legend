import {  ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { StatusBarService } from "./statusBarService";
import { StatusBar } from "./statusBar";
import { NameValueComp } from "./providedPanels/nameValueComp";
import { TotalAndFilteredRowsComp } from "./providedPanels/totalAndFilteredRowsComp";
import { FilteredRowsComp } from "./providedPanels/filteredRowsComp";
import { TotalRowsComp } from "./providedPanels/totalRowsComp";
import { SelectedRowsComp } from "./providedPanels/selectedRowsComp";
import { AggregationComp } from "./providedPanels/aggregationComp";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const StatusBarModule: Module = {
    moduleName: ModuleNames.StatusBarModule,
    beans: [StatusBarService],
    agStackComponents: [
        { componentName: 'AgStatusBar', componentClass: StatusBar },
        { componentName: 'AgNameValue', componentClass: NameValueComp },
    ],
    userComponents: [
        { componentName: 'agAggregationComponent', componentClass: AggregationComp },
        { componentName: 'agSelectedRowCountComponent', componentClass: SelectedRowsComp },
        { componentName: 'agTotalRowCountComponent', componentClass: TotalRowsComp },
        { componentName: 'agFilteredRowCountComponent', componentClass: FilteredRowsComp },
        { componentName: 'agTotalAndFilteredRowCountComponent', componentClass: TotalAndFilteredRowsComp }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
