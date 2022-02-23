import {  ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { ExcelCreator } from "./excelCreator";
import { CsvCreator, GridSerializer } from "components/Grid/modules/csvExport";
import { CsvExportModule } from "components/Grid/modules/csvExport";
import { Module } from 'components/Grid/core/ts/interfaces/iModule';

export const ExcelExportModule: Module = {
    moduleName: ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator,

        // these beans are part of CSV Export module
        GridSerializer, CsvCreator
    ],
    dependantModules: [
        CsvExportModule,
        EnterpriseCoreModule
    ]
};
