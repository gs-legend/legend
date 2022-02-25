import { ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { HorizontalResizeComp } from "./horizontalResizeComp";
import { SideBarComp } from "./sideBarComp";
import { SideBarButtonsComp } from "./sideBarButtonsComp";
import { ToolPanelColDefService } from "./common/toolPanelColDefService";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const SideBarModule: Module = {
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService],
    agStackComponents: [
        { componentName: 'AgHorizontalResize', componentClass: HorizontalResizeComp },
        { componentName: 'AgSideBar', componentClass: SideBarComp },
        { componentName: 'AgSideBarButtons', componentClass: SideBarButtonsComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
