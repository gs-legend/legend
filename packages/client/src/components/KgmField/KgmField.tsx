import { RootState } from "core/store";
import { connect } from "react-redux";
import KgmCheckBox from "./Fields/KgmCheckBox/KgmCheckBox";
import KgmDateTime from "./Fields/KgmDateTime/KgmDateTime";
import KgmNumber from "./Fields/KgmNumber/KgmNumber";
import KgmSelect from "./Fields/KgmSelect/KgmSelect";
import KgmText from "./Fields/KgmText/KgmText";

type OwnProps = {
  presentationRule: any;
  data: any;
  onChange: any;
  presentation: any;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {};

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  typeof mapDispatchToProps;

const KgmField = ({
  presentation,
  presentationRule,
  data,
  onChange,
}: Props) => {
  const renderField = () => {
    let retVal = <></>;
    switch (presentationRule.htmlControl) {
      case "text":
        retVal = (
          <KgmText
            presentationRule={presentationRule}
            data={data}
            onChange={onChange}
          />
        );
        break;
      case "number":
        retVal = (
          <KgmNumber
            presentationRule={presentationRule}
            data={data}
            onChange={onChange}
          />
        );
        break;
      case "select":
        retVal = (
          <KgmSelect
            presentationRule={presentationRule}
            data={data}
            onChange={onChange}
          />
        );
        break;
      case "checkbox":
        retVal = (
          <KgmCheckBox
            presentationRule={presentationRule}
            data={data}
            onChange={onChange}
          />
        );
        break;
      case "datetime":
        retVal = (
          <KgmDateTime
            presentationRule={presentationRule}
            data={data}
            onChange={onChange}
          />
        );
        break;
      // case "embed":
      //   retVal = (
      //     <KgmEmbedList
      //       presentationRule={presentationRule}
      //       data={data}
      //       presentation={presentation}
      //       onChange={onChange}
      //     />
      //   );
      //   break;
    }
    return retVal;
  };
  return <>{renderField()}</>;
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmField);
