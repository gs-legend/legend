import { Module } from "components/Grid/core/ts/interfaces/iModule";
import {   ModuleNames } from "../../core";
import { CsvCreator } from "./csvCreator";
import { GridSerializer } from "./gridSerializer";

export const CsvExportModule: Module = {
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, GridSerializer]
};
