import React, { ReactNode } from "react";
import { RootState } from "core/store";
import { connect } from "react-redux";

import "./reports.less";

type OwnProps = {
  children: ReactNode;
};

const mapDispatchToProps = {};

const mapStateToProps = (state: RootState) => {
  return {};
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  OwnProps;

const Reports = ({ children }: Props) => {
  return <div className="title">{children}</div>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
