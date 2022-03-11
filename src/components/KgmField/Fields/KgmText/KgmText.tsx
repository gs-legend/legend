import { Form, Input } from "antd";
import ProcessHelper from "core/helpers/ProcessHelper";
import _ from "lodash";
import { ReactElement, useRef, useState } from "react";
import "./index.less";

type Props = {
  presentationRule: any;
  data: any;
  onChange: any;
  isEditing: boolean;
  defaultVal: ReactElement;
  constructOutputData: any;
};


const KgmText = ({ presentationRule, data, onChange, isEditing, defaultVal, constructOutputData }: Props) => {
  const { label, attrName, readOnly, mandatory } = presentationRule;
  const _value = _.get(data, attrName);
  const [value, setValue] = useState(_value);

  const onFieldChanged = (e: any) => {
    onChange(attrName, e.target.value);
    setValue(e.target.value);
  };

  const getVisibleValue = () => {
    let str: ReactElement, presentationAttrName;
    const emailReg = /(.+)@(.+)\.(.+)/;
    const webUrlReg = /(www\.){0,1}[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\\=]*)/;
    let emailWebFlag = false;
    let hasWhiteSpace = false;
    const value = _.get(data, presentationRule.attrName);
    let checkedStr = value;

    if (/\s/g.test(value)) {
      hasWhiteSpace = true
    }
    if (!hasWhiteSpace && emailReg.test(value)) {
      checkedStr = <a href={"mailto:" + value} className="email">{value}</a>;
      emailWebFlag = true;
    } else if (!hasWhiteSpace && webUrlReg.test(value)) {
      let val = value;
      if (val.substring('http') !== 0) {
        val = 'http://' + val;
      }
      checkedStr = <a href={val} target="_blank" className="email">{value}</a>;
      emailWebFlag = true;
    } else {
      checkedStr = value || "";
      emailWebFlag = false;
    }

    if (presentationRule.attrName && presentationRule.attrName.indexOf(".") >= 0) {
      presentationAttrName = presentationRule.attrName.split(".");
      let entity = _.get(data, presentationAttrName[0]);
      if (_.isArray(entity)) {
        checkedStr = _.get(entity[0], presentationAttrName[1]);
      }
    }
    const fontStyles = ProcessHelper.getfontStyles(presentationRule);
    str = <span className={fontStyles.fontStr} style={{ color: fontStyles.fgColor }}> {checkedStr}</span >;
    if (presentationRule.attrName && presentationRule.attrName.indexOf(".") >= 0) {
      presentationAttrName = presentationRule.attrName.split(".");
      presentationAttrName = presentationAttrName[0];
      if (data[presentationAttrName] && data[presentationAttrName].Color) {
        const fgColor = data[presentationAttrName].Color.fgCode;
        const bgColor = data[presentationAttrName].Color.bgCode;
        str = <span className="statusWrap">
          <span className="statusIcon" style={{ backgroundColor: fgColor }}></span>
          {checkedStr}
        </span>
      }
    }
    if (!str) {
      str = <>{ProcessHelper.noValueText()}</>
    }
    return str;
  }

  return (
    isEditing ?
      <div className={"field-wrapper" + (readOnly ? " disabled" : "")}>
        <Input
          allowClear
          defaultValue={value}
          readOnly={readOnly}
          onChange={onFieldChanged}
        />
      </div> :
      <>{getVisibleValue()}</>
  );
};

export default KgmText;
