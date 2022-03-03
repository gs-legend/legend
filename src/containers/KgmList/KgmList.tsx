import { CONSTANTS } from 'core/Constants';
import { IRuntimeInput } from 'core/Interfaces';
import { callProcessDataActions, selectSplitPane, setSearchKeyAction } from 'core/services/kgm/ProcessService';
import { RootState } from 'core/store';
import { createLoadRequest, createSearchRequest, createStartRequest } from 'core/utils/ProcessUtils';
import processHelper from "core/helpers/ProcessHelper";
import { connect } from 'react-redux';
import KgmGrid from 'components/KgmGrid/KgmGrid';
import { selectTheme } from 'core/services/kgm/PresentationService';
import _ from "lodash";
import PolicyExecution from 'core/helpers/PolicyExecution';
import { useEffect, useState } from 'react';
import ActionTriggers from 'components/ActionTriggers/ActionTriggers';

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
  const [triggers, setTriggers] = useState(new Map<object, boolean>());
  const [selectedRecords, setSelectedRecords] = useState([]);

  useEffect(() => {
    callUiPolicy(data);
  }, [])

  const onRecordsSelect = (rows) => {
    setSelectedRecords(rows);
  }

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
    const { presentationActions, dataActions } = PolicyExecution.applyPrecondition(primaryEntity, items, data, presentation);
    // new PolicyExecution().applyNonFieldPrecondition(primaryEntity, items, data, presentation);
    setTriggers(presentationActions);
  };


  const callRowUiPolicy = (item: any) => {
    const { presentationActions, dataActions } = PolicyExecution.applyPrecondition(primaryEntity, item, data, presentation);
    setTriggers(presentationActions);
    // new PolicyExecution().applyNonFieldPrecondition(primaryEntity, item, data, presentation);
  }

  const onTriggerClick = async (action) => {
    const request = createStartRequest(action.processName, tabId);
    if (action.contextForward) {
      request.inputData.detailedObjects[primaryEntity] = selectedRecords;
    }
    const response = await processHelper.makeRequest(request);
    console.log(response)
  }

  return (
    <>
      <KgmGrid process={process} data={gridData} constructOutputData={constructOutputData} gridChange={gridChange} gridSearch={gridSearch} onRecordsSelect={onRecordsSelect} currentSearchKey={currentSearchKey} theme={theme} />
      <ActionTriggers triggers={triggers} onTriggerClick={onTriggerClick} selectedRecordsLength={selectedRecords.length} />
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(KgmList);