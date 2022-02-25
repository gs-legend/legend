import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';

import { NumberFormat } from '../../../assets/excelInterfaces';

const numberFormatFactory: ExcelOOXMLTemplate = {
    getTemplate(numberFormat: NumberFormat) {
        const {formatCode, numFmtId} = numberFormat;

        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode,
                    numFmtId
                }
            }
        };
    }
};

export default numberFormatFactory;
