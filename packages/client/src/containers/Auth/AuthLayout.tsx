import React, { ReactNode, useEffect } from 'react';
import './Auth.less';
import * as kagami_logo from 'assets/images/Kagami_Logo.png';
import * as crm from 'assets/images/crm.png';
import * as finance from 'assets/images/finance.png';
import * as hrms from 'assets/images/hrms.png';
import * as inventory from 'assets/images/inventory.png';
import * as productions from 'assets/images/productions.png';
import * as sales from 'assets/images/sales.png';
import { RootState } from 'core/store';
import { selectLogo, domainActions, selectDomain, logoActions } from 'core/services/auth';
import { connect, useDispatch } from 'react-redux';

const mapStateToProps = (state: RootState) => {
  return {
    logo: selectLogo(state),
    domain: selectDomain(state),
    getDomain: domainActions.request,
    getLogo: logoActions.request
  }
}

type Props = ReturnType<typeof mapStateToProps> & {
  children: ReactNode;
};

const AuthLayout = ({ children, logo, domain, getDomain, getLogo }: Props) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getDomain({}));
    dispatch(getLogo({}));
    return () => {
    }
  }, [])


  return (
    <div className="login-bg">
      <div className="wrapper">
        <div className="leftSection">
          <div className="lSection">
            <h3>
              <img src={kagami_logo.default} title="Powered by KagamiERP" alt="logo1" />
            </h3>
            <p>Kagami is an AI powered, change-ready, quick-launch ERP platform, which can create custom software solutions that fit your business processes in a remarkably short time.</p>
            <div className="iconSections">
              <div className="iconWidget">
                <img src={crm.default} alt="crm" />
                <p>CRM</p>
              </div>
              <div className="iconWidget">
                <img src={finance.default} alt="finance" />
                <p>Finance</p>
              </div>
              <div className="iconWidget">
                <img src={hrms.default} alt="hrms" />
                <p>HRMS</p>
              </div>
              <div className="iconWidget">
                <img src={inventory.default} alt="inventory" />
                <p>Inventory</p>
              </div>
              <div className="iconWidget">
                <img src={productions.default} alt="productions" />
                <p>Production</p>
              </div>
              <div className="iconWidget">
                <img src={sales.default} alt="sales" />
                <p>Sales</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rightSection">
          <div className="loginSection">
            <p className="companyLogo">
              <img alt="logo" className="standard_logo" title="Powered by KagamiERP" src={logo || kagami_logo.default} />
            </p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(AuthLayout);
