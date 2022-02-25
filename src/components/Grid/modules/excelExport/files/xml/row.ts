import { ExcelRow, ExcelXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';
import { XmlElement } from 'components/Grid/core/ts/interfaces/iXmlFactory';
import cell from './cell';

const row: ExcelXMLTemplate = {
    getTemplate(r: ExcelRow): XmlElement {
        const { cells } = r;

        return {
            name: "Row",
            children: cells.map(it => cell.getTemplate(it))
        };
    }
};

export default row;
