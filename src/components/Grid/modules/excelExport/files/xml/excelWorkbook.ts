import { ExcelXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";
import { XmlElement } from "components/Grid/core/ts/interfaces/iXmlFactory";

const excelWorkbook: ExcelXMLTemplate = {
    getTemplate(): XmlElement {
        return {
            name: "ExcelWorkbook",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:excel"
                }
            },
            children: [{
                name: "WindowHeight",
                textNode: "8130"
            }, {
                name: "WindowWidth",
                textNode: "15135"
            }, {
                name: "WindowHeight",
                textNode: "8130"
            }, {
                name: "WindowTopX",
                textNode: "120"
            }, {
                name: "WindowTopY",
                textNode: "45"
            }, {
                name: "ProtectStructure",
                textNode: "False"

            }, {
                name: "ProtectWindow",
                textNode: "False"
            }]
        };
    }
};

export default excelWorkbook;