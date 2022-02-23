import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';

import sheetFactory from './sheet';

const sheetsFactory: ExcelOOXMLTemplate = {
    getTemplate(names: string[]) {
        return {
            name: "sheets",
            children: names.map((sheet, idx) => sheetFactory.getTemplate(sheet, idx))
        };
    }
};

export default sheetsFactory;
