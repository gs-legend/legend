import { ModuleNames } from 'components/Grid/core';
import { Module } from 'components/Grid/core/ts/interfaces/iModule';
import { InfiniteRowModel } from "./infiniteRowModel";

export const InfiniteRowModelModule: Module = {
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModels: { infinite: InfiniteRowModel }
};
