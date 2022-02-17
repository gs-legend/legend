import dataService from "core/data.service";
import api from "core/services/api";
import { GetUserResponse } from "core/services/ApiTypes";
import dmsService from "core/services/kgm/dmsService";
import { createLoadRequest, createStartRequest, generateGUID } from "core/services/kgm/process/process.service";
import _ from 'lodash';

class ProcessHelper {
  getOrgLogo = (userContext: GetUserResponse, process: string, setLogo: Function) => {
    const localGUID = generateGUID();
    const request = createStartRequest(process, localGUID);
    request.inputData.detailedObjects['UserInput'] = [{
      'userId': userContext.userId,
      'id': "temp_" + Math.random().toString(36).slice(2)
    }];
    api.process(request).then((response: any) => {
      const { data } = response;
      const requestOnLoad = createLoadRequest(process);
      requestOnLoad.guid = localGUID;
      requestOnLoad.inputData.properties.guid = localGUID;

      if (!_.isEmpty(data.constructOutputData)) {
        const pRuleMap = data.constructOutputData.uiResource.presentations.presentationRuleMap;
        const entityId = data.constructOutputData.uiResource.presentations.entityLevelMap[0];
        requestOnLoad.uiEvent.uiEventValue = pRuleMap[entityId][0].presentationId + "_onLoad";
      }
      api.process(requestOnLoad).then((processResponse: any) => {
        const resData = processResponse.data;
        if (resData.constructOutputData.detailedObjects.Organization && resData.constructOutputData.detailedObjects.Organization.length && resData.constructOutputData.detailedObjects.Organization[0].logo) {
          const requestObj = {
            docId: resData.constructOutputData.detailedObjects.Organization[0].logo.split(":")[0]
          };
          dmsService.viewDocument(requestObj).then(function (response: any) {
            var imageUrl = dataService.BASE_URL + 'dms/viewDocument?docId=' + processResponse.constructOutputData.detailedObjects.Organization[0].logo.split(":")[0];
            setLogo(imageUrl)
          });
        }
      });
    });
  }

  getProcessDetails = (process: any) => {
    const { presentations } = process;
    const { presentationRuleMap, entityLevelMap } = presentations;
    const entity = entityLevelMap[0];
    const mainPresentaion = presentationRuleMap[entity];
    const embedPresentations: any = [];
    _.each(mainPresentaion, (pEntity: any) => {
      if (pEntity.entityId !== entity) {
        embedPresentations.push({
          ...mainPresentaion[pEntity],
          entityName: pEntity.entityId,
        });
      }
    });
    const { formName, presentationRules } = mainPresentaion[0];
    const columns: any = [
      { field: "", sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true, },
    ];
    const pRuleKeys = Object.keys(presentationRules)
    pRuleKeys.forEach((pRuleKey: any) => {
      const pRule = presentationRules[pRuleKey];
      const column = {
        headerName: pRule.label,
        field: pRule.attrName,
        cellRenderer: (props) => {
          const { colDef, data } = props;
          console.log(props)
          return _.get(data, colDef.field) || "";
        }
      };
      if (pRule.visible) {
        columns.push(column);
      }
    });
    return { entity, formName, columns, presentationRules, embedPresentations, presentation: mainPresentaion[0] };
  };

}

export default new ProcessHelper();