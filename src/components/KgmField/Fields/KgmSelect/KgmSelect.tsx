import { ReactElement, useRef, useState } from 'react'
import { Select } from 'antd';
import _ from 'lodash';
import "./index.less";

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
};

function KgmSelect({ presentationRule, data, onChange, isEditing, defaultVal }: Props) {
  const inputRef = useRef(null);
  const { label, attrName, readOnly, mandatory } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);

  const focusInput = () => {
    if (!readOnly) {
      inputRef.current.focus();
    }
  }

  const onFieldChanged = (e: any) => {
    onChange(attrName, e.target.value);
    setValue(e.target.value);
  };

  return (
    isEditing ?
      <div className={"field-wrapper" + ((value && value.length !== 0) ? " hasValue" : "") + (readOnly ? " disabled" : "")}>
        <Select ref={inputRef} mode="multiple" allowClear style={{ width: '100%' }}
          defaultValue={value} onChange={onFieldChanged} disabled={readOnly}
        >
        </Select>
        <div className="field-placeholder" onClick={focusInput}><span>{label}</span></div>
      </div>
      :
      <>{defaultVal}</>
  )
}

export default KgmSelect