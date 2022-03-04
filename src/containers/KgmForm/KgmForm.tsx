import { RootState } from "core/store";
import { connect } from "react-redux";
import "./index.less";

type OwnProps = {
  process: any;
  data: any;
  constructOutputData: any;
  tabId: string;
  presentationTree: Array<any>;
};

const mapStateToProps = (state: RootState) => {
  return {
  };
};

const mapDispatchToProps = {
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;


function KgmForm({ process, data, constructOutputData, tabId, presentationTree }: Props) {
  return (
    <div>KgmForm</div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(KgmForm);