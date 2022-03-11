import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import _ from 'lodash';
import React, { ReactElement, useState } from 'react'

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};

function KgmFile({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) {
  const { attrName, readOnly, htmlControl } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);

  const onFieldChanged = (e: any) => {
    const selectedVal = e.target.value;
    onChange(attrName, selectedVal);
    setValue(selectedVal);
  };

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        <Upload>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </div>
      :
      <>{defaultVal}</>
  )
}

export default KgmFile