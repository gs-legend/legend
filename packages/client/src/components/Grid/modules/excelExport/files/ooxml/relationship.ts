import { ExcelOOXMLTemplate, ExcelRelationship } from "components/Grid/core/ts/interfaces/iExcelCreator";

const relationshipFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelRelationship) {
        const {Id, Type, Target} = config;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id,
                    Type,
                    Target
                }
            }
        };
    }
};

export default relationshipFactory;
