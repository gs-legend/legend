import { ReactNode, useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import _ from 'lodash';
import './SideNav.less';

import dashboardIcon from 'assets/images/icons/dashboard.png';
import masterDataIcon from 'assets/images/icons/masterdata.png';
import reportsIcon from 'assets/images/icons/reports.png';
import data_migrationIcon from 'assets/images/icons/data_migration.png';
import { selectUser, logoActions } from 'core/services/auth';
import { RootState } from 'core/store';
import { connect, useDispatch } from 'react-redux';
import { DashboardResponse } from 'core/types/Dashboard';
import { FolderOutlined } from '@ant-design/icons';
import { selectUserContext } from 'core/services/kgm/RoleService';
import { callProcessActions, callStaticProcessActions, createStartRequest, generateGUID, selectSplitPane } from 'core/services/kgm/ProcessService';
import { selectDashboard, selectTheme, } from 'core/services/kgm/PresentationService';
import { BsArrowRightSquareFill } from "react-icons/bs";
import processHelper from 'core/helpers/ProcessHelper';

const { Sider } = Layout;
const { SubMenu } = Menu;

type OwnProps = {
    collapsed: boolean;
};

const mapStateToProps = (state: RootState) => {
    return {
        user: selectUser(state),
        dashboard: selectDashboard(state),
        userContext: selectUserContext(state),
        theme: selectTheme(state),
        splitPanes: selectSplitPane(state),
    }
}

const mapDispatchToProps = {
    callProcess: callProcessActions.request,
    setLogo: logoActions.success,
    callStaticProcess: callStaticProcessActions.request,
};

type Props = ReturnType<typeof mapStateToProps> & OwnProps & typeof mapDispatchToProps;

const IconNode = (icon: string) => <img src={icon} alt="" className="menuGroupImage" />;

const adminMenuItems = (user: string) => {
    const masterData = <Menu.Item key="masterData" icon={IconNode(masterDataIcon)}><span className="menu-item-text">Master Data</span></Menu.Item>;
    const reports = <Menu.Item key="reports" icon={IconNode(reportsIcon)}><span className="menu-item-text">Reports</span></Menu.Item>;
    const data_migration = <Menu.Item key="dataMigration" icon={IconNode(data_migrationIcon)}><span className="menu-item-text">Data Migration</span></Menu.Item>;

    const menuItems = [masterData, reports, data_migration];
    return user === "admin" ? menuItems : null;
}

const menuItems = (navigation: any) => {
    const items = Array<ReactNode>();

    _.forEach(navigation.menuItems, (item: any) => {
        const menuItem = getItem(item);
        items.push(menuItem);
    });
    return items;
}

const processItem = (item: any) => {
    let icon = <BsArrowRightSquareFill className='menuItemImage' />;

    if (item.img) {
        icon = <img src={item.img} alt='' className='menuItemImage' />;
    }

    return (
        <Menu.Item key={item.event.process} icon={icon} className='menu-item'>
            {item.name}
        </Menu.Item>
    );
}

const groupItem = (item: any) => {
    const submenus: any = [];
    item.subMenus.forEach((submenuItem: any) => {
        const submenu = getItem(submenuItem);
        submenus.push(submenu);
    });

    return (
        <SubMenu key={item.name.replace(/' '/g, '') + Math.random().toString(36).slice(2)} className="submenu-folder" icon={<FolderOutlined />} title={item.name}>
            {submenus}
        </SubMenu>
    );
}

const getItem = (item: any) => {
    if (item.type === "process") {
        return processItem(item);
    }
    if (item.type === "group") {
        return groupItem(item);
    }
}

const SideNav = ({ collapsed, user, dashboard, userContext, setLogo, theme, callProcess, callStaticProcess, splitPanes }: Props) => {
    const { FirstPane } = splitPanes;
    const dispatch = useDispatch();

    useEffect(() => {
        if (!FirstPane || !FirstPane.currentTab) {
            callStaticProcess({ processName: 'dashboard' });
        }
    }, [dispatch, FirstPane, callStaticProcess]);

    const onMenuItemSelected = (event: any) => {
        const { key } = event;
        const staticProcesses = ['dashboard', 'masterData', 'reports', 'dataMigration'];
        if (staticProcesses.indexOf(key) > -1) {
            callStaticProcess({ processName: key });
        }
        else {
            const guid = generateGUID();
            const request = createStartRequest(key, guid);
            callProcess({ request, isUserTriggered: true, guid });
        }
    }

    const [navigation, setNavigation] = useState({});

    useEffect(() => {
        const setDashBoardData = (dashboard: DashboardResponse) => {
            let navigation: any = {};
            let masterDataGlobal = {};
            if (dashboard && dashboard.container) {
                dashboard.container.forEach((obj) => {
                    switch (obj.panelType) {
                        case "leftPanel":
                            navigation = obj.menuPanel;
                            break;
                        case "masterDataGlobal":
                            masterDataGlobal = obj.menuPanel;
                            break;
                        case "background":
                            if (obj.menuPanel) {
                                const organizationProcess = _.find(obj.menuPanel.menuItems, function (obj: any) {
                                    return obj.name === 'organization_logo';
                                });
                                if (organizationProcess) {
                                    processHelper.getOrgLogo(userContext, organizationProcess.event.process, setLogo);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                });
            }
            return { navigation, masterDataGlobal };
        }

        const { navigation } = setDashBoardData(dashboard);
        setNavigation(navigation);
    }, [dashboard, userContext, setLogo]);

    return (
        <Sider
            theme={theme === "light" ? "light" : "dark"}
            breakpoint="lg"
            collapsed={collapsed}
            width={300}
            className="kgm-sidenav"
        >
            <Menu theme={theme === "light" ? "light" : "dark"} mode="vertical" defaultSelectedKeys={['dashboard']} onClick={(e: any) => onMenuItemSelected(e)}>
                <Menu.Item key="dashboard_icon" icon={IconNode(dashboardIcon)} className="menu-item">
                    <span className="menu-item-text">Dashboard</span>
                </Menu.Item>
                {menuItems(navigation)}
                {adminMenuItems(user)}
            </Menu>
        </Sider>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(SideNav);