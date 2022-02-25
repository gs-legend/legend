import { ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { Module } from 'components/Grid/core/ts/interfaces/iModule';
import { ViewportRowModel } from "./viewportRowModel";

export const ViewportRowModelModule: Module = {
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModels: { viewport: ViewportRowModel },
    dependantModules: [
        EnterpriseCoreModule
    ]
};
