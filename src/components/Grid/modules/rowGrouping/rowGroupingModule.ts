import {  ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { AggregationStage } from "./aggregationStage";
import { GroupStage } from "./groupStage";
import { PivotColDefService } from "./pivotColDefService";
import { PivotStage } from "./pivotStage";
import { AggFuncService } from "./aggFuncService";
import { GridHeaderDropZones } from "./columnDropZones/gridHeaderDropZones";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const RowGroupingModule: Module = {
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
