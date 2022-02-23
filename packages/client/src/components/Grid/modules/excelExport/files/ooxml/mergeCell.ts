import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';


const mergeCellFactory: ExcelOOXMLTemplate = {
    getTemplate(ref: string) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref
                }
            }
        };
    }
};

export default mergeCellFactory;
