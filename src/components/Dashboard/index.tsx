import  { ReactNode } from "react";
import { RootState } from "core/store";
import { connect } from "react-redux";

import "./dashboard.less";

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

const Dashboard = ({ children }: Props) => {
  return <div className="dashboard_title">{children}</div>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
