import { ExcelOOXMLTemplate } from 'components/Grid/core/ts/interfaces/iExcelCreator';
import { XmlElement } from 'components/Grid/core/ts/interfaces/iXmlFactory';
import { Fill } from '../../../assets/excelInterfaces';

const fillFactory: ExcelOOXMLTemplate = {
    getTemplate(fill: Fill) {
        const {patternType, fgTheme, fgTint, fgRgb, bgRgb, bgIndexed} = fill;
        const pf: XmlElement = {
            name: 'patternFill',
            properties: {
                rawMap: {
                    patternType
                }
            }
        };

        if (fgTheme || fgTint || fgRgb) {
            pf.children = [{
                name: 'fgColor',
                properties: {
                    rawMap: {
                        theme: fgTheme,
                        tint: fgTint,
                        rgb: fgRgb
                    }
                }
            }];
        }

        if (bgIndexed || bgRgb) {
            if (!pf.children) { pf.children = []; }
            pf.children.push({
                name: 'bgColor',
                properties: {
                    rawMap: {
                        indexed: bgIndexed,
                        rgb: bgRgb
                    }
                }
            });
        }

        return {
            name: "fill",
            children: [pf]
        };
    }
};

export default fillFactory;