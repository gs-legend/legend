import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';

import xfFactory, { Xf } from './xf';

const cellXfsFactory: ExcelOOXMLTemplate = {
    getTemplate(xfs: Xf[]) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(xf => xfFactory.getTemplate(xf))
        };
    }
};

export default cellXfsFactory;
