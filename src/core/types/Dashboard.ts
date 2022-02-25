export interface Event {
    process: string;
}

export interface SubMenu {
    name: string;
    type: string;
    event: Event;
    groupName: string;
    favourite: boolean;
    build: boolean;
}

export interface MenuItem {
    name: string;
    type: string;
    favourite: boolean;
    subMenus: SubMenu[];
    build: boolean;
    event: Event;
}

export interface MenuPanel {
    menuItems: MenuItem[];
}

export interface Container {
    panelType: string;
    menuPanel: MenuPanel;
}

export interface LeftPanel {
    menuItems: MenuItem[];
}

export interface Favourite {
    id: number;
    processId: string;
    processName: string;
    userId: string;
    groupName: string;
}

export type DashboardResponse = {
    dashboardId: string;
    projectId: string;
    container: Container[];
    leftPanel: LeftPanel;
    favourites: Favourite[];
    buildMaster: boolean;
    buildTrigger: boolean;
}


export type ThemeRequest = {
    theme: string;
}