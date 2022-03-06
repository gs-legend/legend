import { useState } from 'react';
import { Layout, Button, Menu, Dropdown, Space } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, InfoCircleOutlined, CopyrightTwoTone, FullscreenOutlined } from '@ant-design/icons';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { logoutAction, selectLogo } from 'core/services/auth';
import { connect } from 'react-redux';
import { rootPath } from 'core/Config';
import { RootState } from 'core/store';
import { AUTH_ROUTER_PATHS } from 'core/Constants';
import KModal from 'components/KModal/KModal';
import screenfull from 'screenfull';
import ThemeProvider from 'components/ThemeProvider';
import './Header.less';
import user_img from 'assets/images/user.png';
import * as kagami_logo from 'assets/images/logo.png';
import BreadCrumbs from 'components/BreadCrumbs/BreadCrumbs';

type OwnProps = {
    collapsed: boolean;
    onCollapse: Function
};

const mapDispatchToProps = {
    logout: logoutAction
};

const mapStateToProps = (state: RootState) => {
    return {
        logo: selectLogo(state)
    }
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps;

const AboutUs = () => {
    return (
        <>
            <div className='aboutUsContainer'>
                <div className='padding15 borderBtm'>
                    <img src={kagami_logo.default} width='100px' alt='Kagami' />
                </div>
                <div className='padding15 borderBtm'>
                    <p className=''>Kagami Runtime Version 2.0.0</p>
                </div>
                <div className='padding15'>
                    <span>
                        Get help with Kagami
                        <a href='http://kagamierp.com/' target='blank' className='pull-right'>
                            <FaExternalLinkAlt />
                        </a>
                    </span>
                </div>
            </div>
            <div className='aboutUsContainer'>
                <div className='padding15'>
                    <p>Kagami Runtime</p>
                    <p>
                        Copyright <CopyrightTwoTone />
                        &nbsp; 2021 Kagami India pvt. ltd. All rights reserved.
                    </p>
                    <p className='marginT10'>
                        Warning: This program is protected by copyright law and international treaties. Unauthorized reproduction or distribution of this program, or any portions of it, may result in severe civil and criminal penalties, and will be prosecuted to
                        the maximum extent possible under the law.
                    </p>
                </div>
            </div>
        </>
    );
};

const UserOptionsMenu = (logout) => {
    return (
        <Menu>
            <Menu.Item key={"logout"} onClick={logout}>
                <Link to={AUTH_ROUTER_PATHS.logout}>Logout</Link>
            </Menu.Item>
        </Menu>
    );
};

const Header = ({ collapsed, onCollapse, logout, logo }: Props) => {
    const [modalVisible, setModalVisible] = useState(false);

    const menuIcon = () => {
        const collapsedIcon = <MenuUnfoldOutlined onClick={() => onCollapse()} />;
        const expandedIcon = <MenuFoldOutlined onClick={() => onCollapse()} />;
        return collapsed ? collapsedIcon : expandedIcon;
    }

    const fullScreenClicked = (e: any) => {
        const element = document.getElementById('fullscreen_target') as Element;
        if (screenfull.isEnabled) {
            screenfull.request(element);
        }
    };

    const infoIcon = () => {
        const infoMenu =
            <Menu>
                <Menu.Item key="aboutus" onClick={() => { setModalVisible(!modalVisible) }}>
                    <InfoCircleOutlined />
                    About Us
                    <KModal title='About Us' setModalVisible={setModalVisible} isVisible={modalVisible} width={600} onSubmit={() => { }}>
                        {AboutUs()}
                    </KModal>
                </Menu.Item>
            </Menu>;
        return (
            <div>
                <Dropdown overlay={infoMenu} >
                    <div className="header-icon info-icon ant-dropdown-link" onClick={e => e.preventDefault()} />
                </Dropdown>
            </div>
        );
    }

    return (
        <Layout.Header>
            <div>
                {menuIcon()}
                <Link to={rootPath} className="logo">
                    <img alt="logo" className="standard_logo" title="Powered by KagamiERP" src={logo || kagami_logo.default} />
                </Link>
            </div>
            <div style={{ display: "flex", flex: "1 1 0%" }}></div>
            <Space className='header_right'>
                <ThemeProvider />
                <div className='fullscreen_icon' onClick={fullScreenClicked}>
                    <FullscreenOutlined title='Fullscreen' />
                </div>
                {infoIcon()}
                <Dropdown className='' overlay={UserOptionsMenu(logout)}>
                    <Button type='primary' shape='circle' icon={<img alt='user' className='user-image' src={user_img} />}></Button>
                </Dropdown>
            </Space>
        </Layout.Header >
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);