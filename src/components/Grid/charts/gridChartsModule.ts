import {  ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { ChartService } from "components/Grid/charts/chartService";
import { ChartTranslationService } from "components/Grid/charts/chartComp/services/chartTranslationService";
import { ChartCrossFilterService } from "components/Grid/charts/chartComp/services/chartCrossFilterService";

import { RangeSelectionModule } from "components/Grid/modules/rangeSelection";
import { Module } from '../core/ts/interfaces/iModule';

export const GridChartsModule: Module = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslationService, ChartCrossFilterService
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
