import { CONSTANTS } from 'core/Constants';
import { IRuntimeInput } from 'core/Interfaces';
import { callProcessDataActions, selectSplitPane, setSearchKeyAction } from 'core/services/kgm/ProcessService';
import { RootState } from 'core/store';
import { createLoadRequest, createSearchRequest } from 'core/utils/ProcessUtils';
import processHelper from "core/helpers/ProcessHelper";
import { connect } from 'react-redux';
import KgmGrid from 'components/KgmGrid/KgmGrid';
import { selectTheme } from 'core/services/kgm/PresentationService';
import _ from "lodash";
import PolicyExecution from 'core/helpers/PolicyExecution';
import { useState } from 'react';

type OwnProps = {
  process: any;
  data: any;
  constructOutputData: any;
  currentSearchKey: string;
  tabId: string;
};

const mapStateToProps = (state: RootState) => {
  return {
    splitPanes: selectSplitPane(state),
    theme: selectTheme(state),
  };
};

const mapDispatchToProps = {
  callProcessData: callProcessDataActions.request,
  setSearchKeyAction: setSearchKeyAction
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

function KgmList({ process, data, constructOutputData, currentSearchKey, splitPanes, callProcessData, setSearchKeyAction, tabId, theme }: Props) {
  const processDetails = processHelper.getProcessDetails(process, data);
  const { presentation, stepInfo, primaryEntity } = processDetails;
  const gridData = data[primaryEntity];
  const [triggers, setTriggers] = useState([] as Array<any>)


  const gridChange = (searchStr: string, pageNumber: number, pageSize: number) => {
    let request = createLoadRequest(stepInfo.processName, tabId);
    request.inputData.verbProperties[CONSTANTS.PAGENUMBER] = pageNumber;
    request.inputData.verbProperties[CONSTANTS.PAGESIZE] = pageSize;
    request.inputData.verbProperties[CONSTANTS.BYMEFORME] = searchStr;
    request.uiEvent.uiEventValue = presentation.presentationId + "_onLoad";
    makeOnLoadCall(request);
  }

  const gridSearch = (searchStr: string, pageNumber: number) => {
    const runtimeInput: IRuntimeInput = {
      id: CONSTANTS.RuntimeInput,
      searchKey: searchStr
    }
    const request = createSearchRequest(stepInfo.processName, presentation.presentationId, tabId, runtimeInput, pageNumber);
    makeOnLoadCall(request);
    setSearchKeyAction({ processName: stepInfo.processName, searchKey: searchStr });
  }

  const onLoadCallback = (response) => {
    console.log(response);
  }
  const makeOnLoadCall = (request) => {
    callProcessData({ request, onLoadCallback });
  }

  const callUiPolicy = (items: Array<any>) => {
    // new PolicyExecution().applyPrecondition(primaryEntity, items, data, presentation);
    // new PolicyExecution().applyNonFieldPrecondition(primaryEntity, items, data, presentation);

    _.forEach(presentation.actions, function (action) {
      if (action.contextForward && (!items.length || (!action.selectMultiple && items.length > 1))) {
        action.$$disabled = true;
      }
    });
  };


  const callRowUiPolicy = (item: any) => {
    // new PolicyExecution().applyPrecondition(primaryEntity, item, data, presentation);
    // new PolicyExecution().applyNonFieldPrecondition(primaryEntity, item, data, presentation);
    item.actions = _.cloneDeep(presentation.actions);
  }

  return (
    <>
      <KgmGrid process={process} data={gridData} constructOutputData={constructOutputData} gridChange={gridChange} gridSearch={gridSearch} currentSearchKey={currentSearchKey} theme={theme} />;
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(KgmList);