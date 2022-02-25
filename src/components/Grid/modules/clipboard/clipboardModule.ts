import {   ModuleNames } from 'components/Grid/core';
import { EnterpriseCoreModule } from 'components/Grid/core';
import { Module } from 'components/Grid/core/ts/interfaces/iModule';
import { CsvExportModule } from "components/Grid/modules/csvExport";
import { ClipboardService } from "./clipboardService";

export const ClipboardModule: Module = {
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule,
        CsvExportModule
    ]
};
