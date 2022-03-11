import { Select } from 'antd';
import { CONSTANTS } from 'core/Constants';
import PresentationHelper from 'core/helpers/PresentationHelper';
import _ from 'lodash';
import React, { ReactElement, useEffect, useState } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};

function KgmTreeSelect({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const { label, attrName, readOnly, mandatory, htmlControl } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const displayAttributes = PresentationHelper.getDisplayAttributes(presentationRule);
  const entityConsumed = PresentationHelper.getEntityConsumed(presentationRule);

  useEffect(() => {
    renderOptions();
  }, [data])

  const onFieldChanged = (values: Array<any>) => {
    onChange(attrName, values);
    setValue(values);
  };

  const renderOptions = () => {
    let options = [];
    let optionsData = constructOutputData[entityConsumed];
    if (optionsData === CONSTANTS.REMOVED) {
      optionsData = [];
    }
    optionsData.map(option => {
      const displayString = PresentationHelper.computeDisplayString(option, displayAttributes);
      const _option = <Select.Option key={entityConsumed + "_" + option.id} value={option.id} >{displayString}</Select.Option>;
      options.push(_option);
    });
    setDropdownOptions(options);
  }

  const getVisibleVal = () => {
    return PresentationHelper.computeDisplayString(value, displayAttributes);
  }

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        <Select showSearch={htmlControl === "search"} mode={htmlControl === "multiselect" ? "tags" : null} allowClear style={{ width: '100%' }} showAction={['focus', 'click']}
          defaultValue={value} onChange={onFieldChanged} disabled={readOnly} placement="bottomLeft"
        >
          {dropdownOptions}
        </Select>
      </div>
      :
      <>{getVisibleVal()}</>
  )
}

export default KgmTreeSelect