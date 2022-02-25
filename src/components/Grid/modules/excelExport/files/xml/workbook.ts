import { ExcelXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";
import { XmlElement } from "components/Grid/core/ts/interfaces/iXmlFactory";

const workbook: ExcelXMLTemplate = {
    getTemplate(): XmlElement {
        return {
            name: "Workbook",
            properties: {
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        o: "urn:schemas-microsoft-com:office:office",
                        x: "urn:schemas-microsoft-com:office:excel",
                        ss: "urn:schemas-microsoft-com:office:spreadsheet",
                        html: "http://www.w3.org/TR/REC-html40"
                    },
                }],
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            }
        };
    }
};

export default workbook;
