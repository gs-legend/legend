import ProcessHelper from "core/helpers/ProcessHelper";
import API from "core/services/Api";
import { createOnClickRequest, newId } from "core/utils/ProcessUtils";
import { generateGUID } from 'core/utils/ProcessUtils';

export const getMultiListPreviewData = async (presentationRule, processName, primaryEntity, data, tabId) => {
  const response = await API.getPresentationRule({ presentationRule: presentationRule.embeddedPresentationId });
  const presentation = response.data;
  const attributeName = presentation.presentationId + '_onClick_' + presentation.entityPrefix + presentation.entityId;
  let request: any = createOnClickRequest(processName, tabId);
  request.inputData.detailedObjects[primaryEntity] = [{ id: data.id }];
  request.inputData.embeddedInfo = {
    entityPageMap: {
      [presentation.entityId]: {
        pageNumber: 1,
        pageSize: 25
      }
    },
    entitySearchMap: {},
    entityInput: {
      entityId: primaryEntity,
      participatingEntities: [presentation.entityId]
    }
  }
  const res = await ProcessHelper.makeRequest(request);
  const newData = res.data;
  const presentations = {
    entityLevelMap: [presentation.entityId],
    presentationRuleMap: {
      [presentation.entityId]: [
        presentation
      ]
    }
  }
  newData.constructOutputData.uiResource = { presentations: presentations, uiTemplate: presentation.uiTemplate };
  newData.constructOutputData.verbProperties = {
    totalRecords: 1,
    startRecord: 1,
    endRecord: 1,
    pageSize: 25
  }
  newData.constructOutputData.detailedObjects = newData.constructOutputData.detailedObjects[primaryEntity][0];
  return newData;
}
