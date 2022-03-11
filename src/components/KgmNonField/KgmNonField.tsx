import { Button } from "antd";
import { NONFIELDPRESENTATION_TYPES } from "core/Constants";
import "./index.less";

type Props = {
  presentationRule: any;
  data: any;
};


function KgmNonField({ presentationRule, data }: Props) {
  const { type } = presentationRule;

  const triggerAction = () => {
    const { linkProcess, content } = presentationRule.metaData;
    console.log(linkProcess, content);
  }

  const renderNonField = () => {
    let retVal = <></>;
    switch (type) {
      case NONFIELDPRESENTATION_TYPES.HEADER:
        retVal = <h4>{presentationRule.metaData.content}</h4>
        break;
      case NONFIELDPRESENTATION_TYPES.PARAGRAPH:
        retVal = <p>{presentationRule.metaData.content}</p>
        break;
      case NONFIELDPRESENTATION_TYPES.HYPERLINK:
        retVal = <a href={presentationRule.uiSettings.link} target="_blank">{presentationRule.uiSettings.displayName}</a>
        break;
      case NONFIELDPRESENTATION_TYPES.LINE_BREAK:
        retVal = <hr />
        break;
      case NONFIELDPRESENTATION_TYPES.BUTTON:
        const icon = presentationRule.uiSettings?.icon;
        if (icon) {
          const image = <img src={icon} title={presentationRule.metaData.content} />;
          retVal = <Button type="primary" icon={image} onClick={triggerAction}></Button>
        } else {
          retVal = <Button type="primary" onClick={triggerAction}>
            <span>
              {presentationRule.uiSettings.buttonType.key}
            </span>
            <span>
              {presentationRule.metaData.content}
            </span>
          </Button>
        }
        break;
    }
    return retVal;
  }

  return (
    <>
      {renderNonField()}
    </>
  )
}

export default KgmNonField