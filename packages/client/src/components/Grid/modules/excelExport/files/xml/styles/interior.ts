import { ExcelStyle, ExcelXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";
import { XmlElement } from "components/Grid/core/ts/interfaces/iXmlFactory";

const interior: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const { color, pattern, patternColor } = styleProperties.interior!;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        Color: color,
                        Pattern: pattern,
                        PatternColor: patternColor
                    }
                }]
            }
        };
    }
};

export default interior;
