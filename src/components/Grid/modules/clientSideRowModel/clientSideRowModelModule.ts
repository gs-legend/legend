import {   ModuleNames } from 'components/Grid/core';
import { ClientSideRowModel } from "./clientSideRowModel";
import { FilterStage } from "./filterStage";
import { SortStage } from "./sortStage";
import { FlattenStage } from "./flattenStage";
import { SortService } from "./sortService";
import { FilterService } from "./filterService";
import { ImmutableService } from "./immutableService";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const ClientSideRowModelModule: Module = {
    moduleName: ModuleNames.ClientSideRowModelModule,
    beans: [FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
    rowModels: {clientSide: ClientSideRowModel}
};
