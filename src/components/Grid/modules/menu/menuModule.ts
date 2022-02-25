import {   ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { EnterpriseMenuFactory } from "./enterpriseMenu";
import { ContextMenuFactory } from "./contextMenu";
import { MenuItemMapper } from "./menuItemMapper";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const MenuModule: Module = {
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
