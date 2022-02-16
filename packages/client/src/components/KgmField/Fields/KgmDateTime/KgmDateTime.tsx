import { DatePicker, Form } from 'antd';
import { RootState } from 'core/store';
import _ from 'lodash';
import { connect } from 'react-redux';

type OwnProps = {
  presentationRule: any;
  data: any;
  onChange: any;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = {};

type Props = ReturnType<typeof mapStateToProps> & OwnProps & typeof mapDispatchToProps;

const KgmDateTime = ({ presentationRule, data, onChange }: Props) => {
  const { label, attrName, readOnly, mandatory } = presentationRule;
  const value = _.get(data, attrName);

  const onFieldChanged = (val: any) => {
    onChange(attrName, val);
  };
  
  return (
    <div className='field text-field'>
      <Form.Item label={label} name={attrName}>
        <div className='input-field'>
          <DatePicker defaultValue={value} disabled={readOnly} onChange={onFieldChanged} />
        </div>
      </Form.Item>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(KgmDateTime);
