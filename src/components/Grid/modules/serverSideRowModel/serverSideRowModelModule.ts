import {   ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { ServerSideRowModel } from "./serverSideRowModel";
import { StoreUtils } from "./stores/storeUtils";
import { BlockUtils } from "./blocks/blockUtils";
import { NodeManager } from "./nodeManager";
import { TransactionManager } from "./transactionManager";
import { ExpandListener } from "./listeners/expandListener";
import { SortListener } from "./listeners/sortListener";
import { FilterListener } from "./listeners/filterListener";
import { StoreFactory } from "./stores/storeFactory";
import { ListenerUtils } from "./listeners/listenerUtils";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { serverSide: ServerSideRowModel },
    beans: [ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
