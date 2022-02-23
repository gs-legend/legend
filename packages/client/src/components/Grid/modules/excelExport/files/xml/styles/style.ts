import { ExcelStyle, ExcelXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";
import { XmlElement } from "components/Grid/core/ts/interfaces/iXmlFactory";

const style: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const { id, name } = styleProperties;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        ID: id,
                        Name: name ?  name : id
                    }
                }]
            }
        };
    }
};

export default style;
