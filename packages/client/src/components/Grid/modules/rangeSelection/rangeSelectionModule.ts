import {  ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { RangeService } from "./rangeService";
import { FillHandle } from "./fillHandle";
import { RangeHandle } from "./rangeHandle";
import { SelectionHandleFactory } from "./selectionHandleFactory";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const RangeSelectionModule: Module = {
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
