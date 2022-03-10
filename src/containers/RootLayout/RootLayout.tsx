import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import './RootLayout.less';
import IsLoggedIn from 'core/services/auth/guards/IsLoggedIn';
import Header from 'components/Header/Header';
import SideNav from 'components/SideNav/SideNav';
import Content from 'containers/Content/Content';
import { RootState } from 'core/store';
import { connect } from 'react-redux';
import { selectTheme, } from 'core/services/kgm/PresentationService';
import { LicenseManager } from 'ag-grid-enterprise';

const { Footer } = Layout;

const mapStateToProps = (state: RootState) => {
    return {
        theme: selectTheme(state),
    }
}

const mapDispatchToProps = {
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;


const RootLayout = ({ theme }: Props) => {
    const [collapsed, setCollapsed] = useState(true);

    useEffect(() => {
        LicenseManager.setLicenseKey("LICENSE_HACK_BY_SUDHEER_[v26.1.1]__b1507244ab90657f098d0e85024b36d5")
    }, []);

    const onCollapse = () => {
        setCollapsed(!collapsed);
    }
    const year = new Date().getFullYear();
    return (
        <div className={"rootlayout" + (theme === "dark" ? " dark-theme" : "")}>
            <Layout>
                <Header collapsed={collapsed} onCollapse={onCollapse} />
                <Layout>
                    <SideNav collapsed={collapsed} />
                    <Layout.Content className="main_container">
                        <Content></Content>
                        <Footer>
                            <strong>Copyright © {year} <a href="http://kagamierp.com/" target="_blank" rel="noopener noreferrer">Kagami India Pvt. Ltd</a>.</strong>
                        </Footer>
                    </Layout.Content>
                </Layout>
            </Layout>
        </div>
    );
}

export default IsLoggedIn(connect(mapStateToProps, mapDispatchToProps)(RootLayout));
