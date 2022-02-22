import "./index.less";
import { useEffect } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { RootState } from 'core/store';
import processHelper from "core/helpers/ProcessHelper";
import { callProcessDataActions } from "core/services/kgm/ProcessService";
import KgmGrid from "components/KgmGrid/KgmGrid";

type OwnProps = {
  process: any;
  data: any;
  processKey: string;
  constructOutputData: any;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {
  callProcessData: callProcessDataActions.request,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const getProcessTemplate = (process: any, data: any, constructOutputData: any) => {
  const { uiTemplate } = process;
  let node: any = null;
  switch (uiTemplate) {
    case 'list':
      node = <KgmGrid process={process} data={data} constructOutputData={constructOutputData} />;
      break;
    default:
      break;
  }
  return node;
};

const ProcessContainer = ({ process, processKey, data, callProcessData, constructOutputData }: Props) => {
  const processDetails = processHelper.getProcessDetails(process, data);
  const { presentation } = processDetails;
  useEffect(() => {
    if (presentation.onLoadRequired) {
      callProcessData(processKey);
    }
  }, [callProcessData, processKey]);
  const className = 'process_tab tab ' + processKey;
  return <div className={className}>{getProcessTemplate(process, data, constructOutputData)}</div>;
};
export default connect(mapStateToProps, mapDispatchToProps)(ProcessContainer);
