import { ReactElement, useEffect, useRef, useState } from 'react'
import { Select } from 'antd';
import _ from 'lodash';
import "./index.less";
import PresentationHelper from 'core/helpers/PresentationHelper';

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};

function KgmSelect1({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const inputRef = useRef(null);
  const { label, attrName, readOnly, mandatory, htmlControl } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const displayAttributes = PresentationHelper.getDisplayAttributes(presentationRule);
  const entityConsumed = PresentationHelper.getEntityConsumed(presentationRule);

  useEffect(() => {
    renderOptions();
  }, [data])

  const focusInput = () => {
    if (!readOnly) {
      inputRef.current.focus();
    }
  }

  const onFieldChanged = (values: Array<any>) => {
    onChange(attrName, values);
    setValue(values);
  };

  const renderOptions = () => {
    let options = [];
    const optionsData = constructOutputData[entityConsumed];
    optionsData.map(option => {
      const displayString = PresentationHelper.computeDisplayString(option, displayAttributes);
      const selectOption = <Select.Option key={entityConsumed + "_" + option.id} value={option.id} >{displayString}</Select.Option>;
      options.push(selectOption);
    });
    setDropdownOptions(options);
  }

  return (
    isEditing ?
      <div className={"field-wrapper" + ((value && value.length !== 0) ? " hasValue" : "") + (readOnly ? " disabled" : "")}>
        <Select ref={inputRef} showSearch={htmlControl === "search"} mode={htmlControl === "multiselect" ? "tags" : null} allowClear style={{ width: '100%' }} showAction={['focus', 'click']}
          defaultValue={value} onChange={onFieldChanged} disabled={readOnly} placement="bottomLeft"
        >
          {dropdownOptions}
        </Select>
        <div className="field-placeholder" onClick={focusInput}><span>{label}</span></div>
      </div>
      :
      <>{defaultVal}</>
  )
}

export default KgmSelect1;