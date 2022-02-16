import { Checkbox, Form } from "antd";
import { RootState } from "core/store";
import _ from "lodash";
import { connect } from "react-redux";

type OwnProps = {
  presentationRule: any;
  data: any;
  onChange: any;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {};

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  typeof mapDispatchToProps;

const KgmCheckBox = ({ presentationRule, data, onChange }: Props) => {
  const { label, attrName, readOnly, mandatory } = presentationRule;
  const value = _.get(data, attrName);

  const onFieldChanged = (e: any) => {
    onChange(attrName, e.target.checked);
  };
  return (
    <div className="field text-field">
      <Form.Item
        label={label}
        name={attrName}
        rules={[{ required: mandatory }]}
      >
        <div className="input-field">
          <Checkbox
            defaultChecked={value}
            disabled={readOnly}
            onChange={onFieldChanged}
          />
        </div>
      </Form.Item>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmCheckBox);
