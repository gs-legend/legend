import { ExcelContentType, ExcelOOXMLTemplate } from "components/Grid/core/ts/interfaces/iExcelCreator";

const contentTypeFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelContentType) {
        const {name, ContentType, Extension, PartName} = config;

        return {
            name,
            properties: {
                rawMap: {
                    Extension,
                    PartName,
                    ContentType
                }
            }
        };
    }
};

export default contentTypeFactory;
