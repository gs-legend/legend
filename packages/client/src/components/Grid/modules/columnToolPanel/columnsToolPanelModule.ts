import {   ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { PrimaryColsHeaderPanel } from "./primaryColsHeaderPanel";
import { PrimaryColsListPanel } from "./primaryColsListPanel";
import { ColumnToolPanel } from "./columnToolPanel";
import { PrimaryColsPanel } from "./primaryColsPanel";

import { RowGroupingModule } from "components/Grid/modules/rowGrouping";
import { SideBarModule } from "components/Grid/modules/sideBar";
import { ModelItemUtils } from "./modelItemUtils";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const ColumnsToolPanelModule: Module = {
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel },
    ],
    dependantModules: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule
    ]
};
