import { useState } from 'react';
import { Layout } from 'antd';
import './RootLayout.less';
import IsLoggedIn from 'core/services/auth/guards/IsLoggedIn';
import Header from 'components/Header/Header';
import SideNav from 'components/SideNav/SideNav';
import Content from 'containers/Content/Content';

const { Footer } = Layout;

const RootLayout = () => {
    const [collapsed, setCollapsed] = useState(true);

    const onCollapse = () => {
        setCollapsed(!collapsed);
    }
    const year = new Date().getFullYear();
    return (
        <Layout className="rootlayout"
        // onContextMenu={(e) => e.preventDefault()}
        >
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
    );
}

export default IsLoggedIn(RootLayout);
