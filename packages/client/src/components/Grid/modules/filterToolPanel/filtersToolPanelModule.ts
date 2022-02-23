import {   ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { FiltersToolPanelHeaderPanel } from "./filtersToolPanelHeaderPanel";
import { FiltersToolPanelListPanel } from "./filtersToolPanelListPanel";
import { FiltersToolPanel } from "./filtersToolPanel";
import { SideBarModule } from "components/Grid/modules/sideBar";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const FiltersToolPanelModule: Module = {
    moduleName: ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel },
    ],
    dependantModules: [
        SideBarModule,
        EnterpriseCoreModule
    ]
};
