import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';

import cellStyleFactory, { CellStyle } from './cellStyle';

const cellStylesFactory: ExcelOOXMLTemplate = {
    getTemplate(cellStyles: CellStyle[]) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyle => cellStyleFactory.getTemplate(cellStyle))
        };
    }
};

export default cellStylesFactory;
