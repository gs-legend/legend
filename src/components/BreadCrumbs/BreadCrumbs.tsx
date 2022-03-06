import { Breadcrumb } from 'antd';
import _ from 'lodash';
import "./index.less";

type Props = {
  breadCrumbs: Array<any>;
  goToProcess: any;
};

function BreadCrumbs({ breadCrumbs, goToProcess }: Props) {
  const renderBreadCrumbs = () => {
    let showCrumb = true;
    let retVal = <></>;
    let crumbs = [];
    if (breadCrumbs.length > 1) {
      breadCrumbs.forEach((breadCrumb, index) => {
        let onClick: any = () => goToProcess(breadCrumb.stepInfo);
        if (index === breadCrumbs.length - 1) {
          onClick = () => { };
        }
        const crumb = <Breadcrumb.Item key={breadCrumb.stepInfo.processName} onClick={onClick}>{breadCrumb.label}</Breadcrumb.Item>
        crumbs.push(crumb);
        if (breadCrumb.label.includes("{{")) {
          showCrumb = false;
        }
      });
    }
    if (showCrumb) {
      retVal = <Breadcrumb className='breadcrumbs' separator=">">
        {crumbs}
      </Breadcrumb>
    }

    return retVal;
  }

  return (
    <>{renderBreadCrumbs()}</>
  )
}

export default BreadCrumbs;