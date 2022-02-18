import "./index.less";
import { useEffect } from 'react';
import { connect } from 'react-redux';
import './index.less';
import { RootState } from 'core/store';
import { callProcessDataActions } from 'core/services/kgm/process/process.service';
import KgmList from "components/KgmList/KgmList";
import processHelper from "core/helpers/process.helper";

type OwnProps = {
  process: any;
  data: any;
  processKey: string;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {
  callProcessData: callProcessDataActions.request,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const getProcessTemplate = (process: any, data: any) => {
  const { uiTemplate } = process;
  let node: any = null;
  switch (uiTemplate) {
    case 'list':
      node = <KgmList process={process} data={data} />;
      break;
    default:
      break;
  }
  return node;
};

const ProcessContainer = ({ process, processKey, data, callProcessData }: Props) => {
  const processDetails = processHelper.getProcessDetails(process);
  const { presentation } = processDetails;
  useEffect(() => {
    if (presentation.onLoadRequired) {
      callProcessData(processKey);
    }
  }, [callProcessData, processKey]);
  const className = 'process_tab tab ' + processKey;
  return <div className={className}>{getProcessTemplate(process, data)}</div>;
};
export default connect(mapStateToProps, mapDispatchToProps)(ProcessContainer);
