import { ExcelStyle, ExcelXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";
import { XmlElement } from "components/Grid/core/ts/interfaces/iXmlFactory";

const numberFormat: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const { format } = styleProperties.numberFormat!;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        Format: format
                    }
                }]
            }
        };
    }
};

export default numberFormat;
