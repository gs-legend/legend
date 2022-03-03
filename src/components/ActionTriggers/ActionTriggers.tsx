import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row } from 'antd';
import "./index.less";

type Props = {
  triggers: Map<object, boolean>;
  onTriggerClick: any;
  selectedRecordsLength: number;
};

function ActionTriggers({ triggers, onTriggerClick, selectedRecordsLength }: Props) {
  const renderTriggers = () => {
    let triggerContent = [];
    triggers.forEach((value, key: any) => {
      let label = key.labelName;
      let isCreate = false;
      if (["add", "create", "new"].includes(label.toLowerCase())) {
        label = <span><PlusOutlined /> ADD NEW</span>;
        isCreate = true;
      }
      if (value && ((selectedRecordsLength && !isCreate) || (!selectedRecordsLength && !key.contextForward)) && key.labelName.toLowerCase() !== 'hyperlink') {
        if (selectedRecordsLength > 1 && !key.selectMultiple) return;
        const trigger = <Col key={key.labelName} className='action_trigger_col'>
          <Button className='action_trigger' type="primary" shape="default" size={"middle"} onClick={() => { onTriggerClick(key) }}>{label}</Button>
        </Col>;
        triggerContent.push(trigger);
      }
    });
    return triggerContent;
  }
  return (
    <Row className='action_triggers' justify='center'>{renderTriggers()}</Row>
  )
}

export default ActionTriggers