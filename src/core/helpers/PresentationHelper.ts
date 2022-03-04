import _ from "lodash";
class PresentationHelper {
  createBreadCrumbItem = (constructOutputData) => {
    const { uiResource } = constructOutputData;
    const { presentations } = uiResource;
    const { headerName, presentationRuleMap, entityLevelMap } = presentations;
    let label = "";
    if (headerName) {
      label = headerName;
    } else if (_.isArray(presentations)) {
      label = presentations[0].headerName;
    } else if (presentationRuleMap[entityLevelMap[0]][0].headerName) {
      label = presentationRuleMap[entityLevelMap[0]][0].headerName;
    }

    let item: any = {
      stepInfo: uiResource.stepInfo,
      label: label,
      uiTemplate: uiResource.uiTemplate
    };

    return item;
  };

  addBreadCrumbs = (crumb, crumbs) => {
    let exitingCrumbs = [...crumbs];
    let crumbToBeAdded = true;
    if (exitingCrumbs.length && exitingCrumbs[exitingCrumbs.length - 1].stepInfo.processName === crumb.stepInfo.processName) {
      crumbToBeAdded = false;
      const index = _.findIndex(exitingCrumbs, function (params: any) {
        return params.label == crumb.label && params.verb == crumb.verb;
      })
      if (index > 0) {
        exitingCrumbs = _.slice(exitingCrumbs, 0, index + 1);
      } if (!index) {
        exitingCrumbs = [exitingCrumbs[index]];
      }
    }

    let breadCrumbIndex;
    if (_.find(exitingCrumbs, function (item, index) {
      if (item.stepInfo.stepName === crumb.stepInfo.stepName && item.stepInfo.processName === crumb.stepInfo.processName) {
        breadCrumbIndex = index;
        return true;
      } else {
        return false;
      }
    })) {
      exitingCrumbs = _.take(exitingCrumbs, breadCrumbIndex);
    }

    if (crumbToBeAdded) {
      if (crumb && crumb.label) {
        var arr = crumb.label.split("{{");
        if (arr.length > 1 && !arr[0]) {
          crumb.originalLabel = crumb.label;
          crumb.dynamicHeaderPresent = true;
        } else {
          if (crumb.label.includes("{{")) {
            crumb.dynamicHeaderPresent = true;
          } else {
            crumb.dynamicHeaderPresent = false;
          }
        }
      }
      exitingCrumbs.push(crumb);
    }
    return exitingCrumbs;
  };

  getPresentationTree = (uiResource) => {
    const { presentations } = uiResource;
    const { entityLevelMap, presentationRuleMap } = presentations;
    const mainEntity = entityLevelMap[0];
    const presentationTree = presentationRuleMap[mainEntity];
    const retVal = this.setEmbedPresentations(presentationTree, presentationRuleMap, mainEntity);
    return retVal;
  }

  setEmbedPresentations = (presentationTree, presentationRuleMap, mainEntity) => {
    const _self = this;
    presentationTree.forEach(presentation => {
      const _embed = presentationRuleMap[presentation.entityId];
      if (_embed && mainEntity !== presentation.entityId) {
        presentation.embedPresentations = _embed;
        return _self.setEmbedPresentations(presentation.embedPresentations, presentationRuleMap, mainEntity);
      }
    });
    return presentationTree;
  }
}

export default new PresentationHelper();