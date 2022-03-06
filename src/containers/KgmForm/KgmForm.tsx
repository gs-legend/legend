import { RootState } from "core/store";
import { array } from "prop-types";
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
  const getField = () => {
    presentationTree.forEach(presentation => {
      console.log(presentation)
      const {presentationRules} = presentation;
      presentationRules.forEach(presentationRule => {
        console.log(presentationRule)
      });
    });
    return <></>;
  }
  return (
    <div>{getField()}</div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(KgmForm);