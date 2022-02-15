import React, { ReactNode, useState, useEffect } from 'react';
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
import { selectUserContext } from 'core/services/kgm/role.service';
import api from 'core/services/api';
import dataService from 'core/data.service';
import { GetUserResponse } from 'core/services/ApiTypes';
import { callProcessActions, callStaticProcessActions, createLoadRequest, createStartRequest, generateGUID, selectSplitPane } from 'core/services/kgm/process/process.service';
import dmsService from 'core/services/kgm/dmsService';
import { selectDashboard, selectTheme, } from 'core/services/kgm/presentation.service';
import { BsArrowRightSquareFill } from "react-icons/bs";

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
    console.log(navigation)

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
        <Menu.Item key={item.process + Math.random().toString(36).slice(2)} icon={icon} title={item.name} className='menu-item'>
            <span>
                <span>{item.name}</span>
            </span>
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

const getOrgLogo = (userContext: GetUserResponse, process: string, setLogo: Function) => {
    const localGUID = generateGUID();
    const request = createStartRequest(process);
    request.inputData.detailedObjects['UserInput'] = [{
        'userId': userContext.userId,
        'id': "temp_" + Math.random().toString(36).slice(2)
    }];
    request.guid = localGUID;
    request.inputData.properties.guid = localGUID;
    api.process(request).then((response: any) => {
        const { data } = response;
        const requestOnLoad = createLoadRequest(process);
        requestOnLoad.guid = localGUID;
        requestOnLoad.inputData.properties.guid = localGUID;

        if (!_.isEmpty(data.constructOutputData)) {
            const pRuleMap = data.constructOutputData.uiResource.presentations.presentationRuleMap;
            const entityId = data.constructOutputData.uiResource.presentations.entityLevelMap[0];
            requestOnLoad.uiEvent.uiEventValue = pRuleMap[entityId][0].presentationId + "_onLoad";
        }
        api.process(requestOnLoad).then((processResponse: any) => {
            const resData = processResponse.data;
            if (resData.constructOutputData.detailedObjects.Organization && resData.constructOutputData.detailedObjects.Organization.length && resData.constructOutputData.detailedObjects.Organization[0].logo) {
                const requestObj = {
                    docId: resData.constructOutputData.detailedObjects.Organization[0].logo.split(":")[0]
                };
                dmsService.viewDocument(requestObj).then(function (response: any) {
                    var imageUrl = dataService.BASE_URL + 'dms/viewDocument?docId=' + processResponse.constructOutputData.detailedObjects.Organization[0].logo.split(":")[0];
                    setLogo(imageUrl)
                });
            }
        });
    });
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
        const { item, key } = event;
        const staticProcesses = ['dashboard', 'masterData', 'reports', 'dataMigration'];
        if (staticProcesses.indexOf(key) > -1) {
            callStaticProcess({ processName: key });
        }
        else {
            const request = createStartRequest(key);
            callProcess({ request, isUserTriggered: true });
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
                                    getOrgLogo(userContext, organizationProcess.event.process, setLogo);
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
                <Menu.Item key="dashboard" icon={IconNode(dashboardIcon)} className="menu-item">
                    <span className="menu-item-text">Dashboard</span>
                </Menu.Item>
                {menuItems(navigation)}
                {adminMenuItems(user)}
            </Menu>
        </Sider>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(SideNav);