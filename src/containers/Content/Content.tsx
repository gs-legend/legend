import React, { useEffect } from "react";
import { Layout } from "antd";
import "./Content.less";
import { connect } from "react-redux";
import { getUserActions } from "core/services/kgm/RoleService";
import SpitPane from "containers/SplitPane/SplitPane";
import { getOnLoadActions } from "core/services/kgm/KgmService";


const mapDispatchToProps = {
  getUser: getUserActions.request,
  getOnLoad: getOnLoadActions.request
}

type Props = typeof mapDispatchToProps;

const Content = ({ getUser, getOnLoad }: Props) => {
  useEffect(() => {
    getUser({});
    getOnLoad({});
  }, [getOnLoad, getUser])

  return (
    <Layout.Content className="main_content" id="fullscreen_target">
      <SpitPane />
    </Layout.Content>
  );
};

export default connect(null, mapDispatchToProps)(Content);
