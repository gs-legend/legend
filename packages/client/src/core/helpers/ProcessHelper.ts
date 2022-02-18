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
            let imageUrl = dataService.BASE_URL + 'dms/viewDocument?docId=' + processResponse.constructOutputData.detailedObjects.Organization[0].logo.split(":")[0];
            setLogo(imageUrl)
          });
        }
      });
    });
  }

  getProcessDetails = (process: any, data: Array<any>, editable = false) => {
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
    const columns = this.getStaticColumns(presentationRules, data);
    return { entity, formName, columns, presentationRules, embedPresentations, presentation: mainPresentaion[0] };
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

          if (presentationRule.visible) {
            let renderCol = _.get(data, colDef.field) || "";
            if (presentationRule.policyMap && presentationRule.policyMap.presentation) {
              renderCol = this.policyWrapper(presentationRule, data)
            }
            else if (presentationRule.embeddedPresentationId) {
              if (presentationRule.htmlControl === 'multiselect') {
                renderCol = this.multiSelectWrapper(presentationRule, data)
              } else {
                renderCol = this.embeddedPresentationWrapper(presentationRule, data)
              }
            } else if (presentationRule.htmlControl === 'date') {
              renderCol = this.renderDate(presentationRule, data)
            } else if (presentationRule.htmlControl === 'dateTime') {
              renderCol = this.renderDateTime(presentationRule, data)
            } else if (presentationRule.htmlControl === 'time') {
              renderCol = this.renderTime(presentationRule, data)
            } else if (presentationRule.htmlControl === 'multiselect') {
              renderCol = this.multiSelectWrapper(presentationRule, data)

            } else if (presentationRule.htmlControl === 'treeSelect') {
              renderCol = this.treeSelectWrapper(presentationRule, data)
            } else if (presentationRule.htmlControl === 'image' || presentationRule.htmlControl === 'preview') {
              renderCol = this.imageSelectWrapper(presentationRule, data)
            } else if (presentationRule.htmlControl === 'file') {
              renderCol = this.fileSelectWrapper(presentationRule, data)
            }
            else if ((presentationRule.htmlControl === 'search'
              || presentationRule.htmlControl === 'radio'
              || presentationRule.htmlControl === 'select')) {
              renderCol = this.computeDisplayStringWrapper(presentationRule, data)
            }
            else if (presentationRule.htmlControl === 'text') {
              renderCol = this.textStringWrapper(presentationRule, data)
            }
            else if (presentationRule.htmlControl === 'number') {
              renderCol = this.numberStringWrapper(presentationRule, data)
            }
            else if (presentationRule.htmlControl === 'boolean') {
              renderCol = this.booleanWrapper(presentationRule, data)
            }
            else if (presentationRule.htmlControl === 'currency') {
              renderCol = this.currencyWrapper(presentationRule, data)
            } else if (presentationRule.type === 'REPORT') {
              renderCol = this.reportWrapper(presentationRule, data)
            }
            else if (presentationRule.htmlControl === 'activity' || presentationRule.htmlControl === 'comments' || presentationRule.htmlControl === 'customactivitylog' || presentationRule.htmlControl === 'checklist') {

            } else if (presentationRule.type !== 'REPORT') {
            }
            columns.push(renderCol);
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

  policyWrapper = (presentationRule, data) => {

  }
  multiSelectWrapper = (presentationRule, data) => { }
  embeddedPresentationWrapper = (presentationRule, data) => { }
  renderDate = (presentationRule, data) => { }
  renderDateTime = (presentationRule, data) => { }
  renderTime = (presentationRule, data) => { }
  treeSelectWrapper = (presentationRule, data) => { }
  imageSelectWrapper = (presentationRule, data) => { }
  fileSelectWrapper = (presentationRule, data) => { }
  computeDisplayStringWrapper = (presentationRule, data) => { }
  textStringWrapper = (presentationRule, data) => { }
  numberStringWrapper = (presentationRule, data) => { }
  booleanWrapper = (presentationRule, data) => { }
  currencyWrapper = (presentationRule, data) => { }
  reportWrapper = (presentationRule, data) => { }

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
}

export default new ProcessHelper();