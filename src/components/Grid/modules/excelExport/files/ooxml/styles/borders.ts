import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';
import { BorderSet } from '../../../assets/excelInterfaces';
import borderFactory from './border';

const bordersFactory: ExcelOOXMLTemplate = {
    getTemplate(borders: BorderSet[]) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(border => borderFactory.getTemplate(border))
        };
    }
};

export default bordersFactory;