import { Form, Select } from "antd";
import { getDropdownDataAction } from "core/services/kgm/ProcessService";
import { RootState } from "core/store";
import _ from "lodash";
import { useState } from "react";
import { connect } from "react-redux";

type OwnProps = {
  presentationRule: any;
  data: any;
  onChange: any;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {
  getDropdownData: getDropdownDataAction,
};

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  typeof mapDispatchToProps;

const KgmSelect = ({
  presentationRule,
  data,
  onChange,
  getDropdownData,
}: Props) => {
  const {
    label,
    attrName,
    readOnly,
    entityConsumed, displayAttributes,
    dependsOn,
  } = presentationRule;
  const value = _.get(data, attrName);
  const [optionsData, setOptionsData] = useState([]);
  const getOptions = () => {
    const options = optionsData.map((option: any) => {
      const { id, code, name } = option;
      const labelVals: any = [];
      displayAttributes.forEach((displayAttribute: string) => {
        labelVals.push(_.get(option, displayAttribute));

      });
      return (<Select.Option key={id} value={id}>
        {labelVals.join(" - ")}
      </Select.Option>)
    })
    return options;
  };

  const getData = () => {
    let request = {};
    if (dependsOn && dependsOn.length) {
      _.each(dependsOn, (dep) => {
        let val = _.get(data, dep);
        if (_.isArray(data)) {
          val = _.get(data[0], dep);
        }
        if (!val) return;
        request = { ...request, [dep]: val };
      });
    }
    getDropdownData({
      data: request,
      attr: entityConsumed,
      callBack: setDropDownData,
    });
  };

  const setDropDownData = (res: any) => {
    setOptionsData(res);
  };

  const onFieldChanged = (value: string) => {
    // let selectedValueMap = optionsData.find((e) => e['id'] == value);
    // if(selectedValueMap){
    //   onChange(attrName, selectedValueMap);
    // }
    onChange(attrName, value);
  };
  return (
    <div className="field text-field">
      <Form.Item label={label} name={attrName}>
        <div className="input-field">
          <Select
            onFocus={getData}
            placeholder="Select a person"
            defaultValue={value}
            showSearch={true}
            optionFilterProp="children"
            onSelect={onFieldChanged}
            disabled={readOnly}
            style={{ width: "100%" }}
            filterOption={(input: string, option: any) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {getOptions()}
          </Select>
        </div>
      </Form.Item>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmSelect);
