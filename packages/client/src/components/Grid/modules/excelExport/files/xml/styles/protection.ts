import { ExcelStyle, ExcelXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";
import { XmlElement } from "components/Grid/core/ts/interfaces/iXmlFactory";

const protection: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        Protected: styleProperties.protection!.protected,
                        HideFormula: styleProperties.protection!.hideFormula
                    }
                }]
            }
        };
    }
};

export default protection;
