import { DATA_CONSTANTS } from "core/Constants";
import dataService from "core/DataService";
import api from "core/services/Api";
import { GetUserResponse } from "core/services/ApiTypes";
import { selectApplicationContext } from "core/services/kgm/CacheService";
import dmsService from "core/services/kgm/DmsService";
import { createLoadRequest, createStartRequest, generateGUID } from "core/utils/ProcessUtils";
import { store } from "core/store";
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
      const requestOnLoad = createLoadRequest(process, localGUID);

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
            let imageUrl = dataService.BASE_URL + 'dms/viewDocument?docId=' + processResponse.constructOutputData.detailedObjects.Organization[0].logo.split(":")[0];
            setLogo(imageUrl)
          });
        }
      });
    });
  }

  getProcessDetails = (process: any, data: Array<any>, editable = false) => {
    const { presentations, stepInfo } = process;
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
    const columns = this.getStaticColumns(presentationRules, data);
    return { entity, formName, columns, presentationRules, embedPresentations, presentation: mainPresentaion[0], stepInfo };
  };

  getStaticColumns = (presentationRules: any, formData: Array<any>) => {
    const _self = this;
    const pRuleKeys = Object.keys(presentationRules)
    const columns: any = [
      { field: "", sortable: false, width: 64, filter: false, headerCheckboxSelection: true, checkboxSelection: true, suppressMovable: true, pinned: 'left' },
    ];
    pRuleKeys.forEach((pRuleKey: any) => {
      const presentationRule = presentationRules[pRuleKey];
      const column = {
        headerName: presentationRule.label,
        field: presentationRule.attrName,
        type: 'nonEditableColumn',
        cellRenderer: (props) => {
          const { colDef, data } = props;
          console.log(props, presentationRule)
          let { entityConsumedFullNameForSearch, displayName } = _self.getEntityConsumedFullNameForSearch(presentationRule);

          let isEmbed = false;
          if (presentationRule.attrName == presentationRule.entityConsumed && !displayName) {
            displayName = 'id';
          }
          let pRuleType = "";
          if (presentationRule.type) {
            pRuleType = presentationRule.type
          } else {
            pRuleType = presentationRule['@type']
          }
        }
      };
    });
    return columns;
  }

  getEntityConsumedFullNameForSearch = (presentationRule) => {
    let entityConsumedFullNameForSearch = "", displayName = "";
    if (presentationRule.entityConsumed && _.get(presentationRule, 'source.parent') && _.get(presentationRule, 'source.parent.for_attr')) {
      let displayAttrs = _.cloneDeep(presentationRule.source.parent.for_attr);
      _.remove(displayAttrs, function (obj) {
        return obj.name == 'id'
      })
      if (displayAttrs.length > 0) {
        entityConsumedFullNameForSearch = presentationRule.source.parent.entityPrefix + presentationRule.source.parent.entityId + "." + displayAttrs[0].name;
        displayName = displayAttrs[0].name;
      } else {
        if (presentationRule.source.parent.for_attr.length > 0) {
          entityConsumedFullNameForSearch = presentationRule.source.parent.entityPrefix + presentationRule.source.parent.entityId + "." + presentationRule.source.parent.for_attr[0].name;
          displayName = presentationRule.source.parent.for_attr[0].name
        } else {
          entityConsumedFullNameForSearch = presentationRule.source.parent.entityPrefix + presentationRule.source.parent.entityId;
        }
      }
    }

    return { entityConsumedFullNameForSearch, displayName };
  }

  getVariableValue = (variable, data) => {
    const _self = this;
    let attributes = variable.split('.');
    if (attributes.length == 1) {
      return _.get(data, attributes[0]);
    }
    let local = _.get(data, attributes[0]);
    attributes.shift();
    if (local instanceof Array) {
      let toReturn: any = [];
      for (let i = 0; i < local.length; i++) {
        let result = _self.getVariableValue(attributes.join('.'), local[i]);
        if (result instanceof Array) {
          toReturn = toReturn.concat(result);
        } else {
          toReturn.push(result);
        }
      }
      return toReturn;
    }
    return _self.getVariableValue(attributes.join('.'), local);
  };

  getfontStyles = (presentationRule) => {
    if (!presentationRule) return {};
    let fontStr = '';
    let fgColor = '';
    if (_.get(presentationRule.uiSettings, "fontStyling.label")) {
      const isBold = _.get(presentationRule.uiSettings, "fontStyling.label.fontBold");
      const isItalic = _.get(presentationRule.uiSettings, "fontStyling.label.fontItalic");
      const isUnderline = _.get(presentationRule.uiSettings, "fontStyling.label.fontUnderline");

      fgColor = _.get(presentationRule.uiSettings, "fontStyling.label.fontColor");
      if (!fgColor) {
        fgColor = "#3c3c3c";
      }
      if (isBold) {
        fontStr = fontStr + 'isBold ';
      }
      if (isItalic) {
        fontStr = fontStr + 'italic ';
      }
      if (isUnderline) {
        fontStr = fontStr + 'underline ';
      }
      if (presentationRule.uiSettings.fontStyling.fontSize == 'a') {
        fontStr = fontStr + "fontSizeA ";
      } else if (presentationRule.uiSettings.fontStyling.fontSize == 'a1') {
        fontStr = fontStr + "fontSizeA1 ";

      } else if (presentationRule.uiSettings.fontStyling.fontSize == 'a2') {
        fontStr = fontStr + "fontSizeA2 ";
      }
    }
    return { fontStr: fontStr, fgColor: fgColor };
  }

  noValueText = function () {
    let noDataText;
    const appContext = selectApplicationContext(store.getState());
    if (appContext?.noDataText) {
      noDataText = appContext?.noDataText;
    } else {
      noDataText = DATA_CONSTANTS.NO_DATA_TEXT
    }
    return noDataText;
  }
}

export default new ProcessHelper();