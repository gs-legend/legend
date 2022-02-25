export interface SystemLanguage {
    masterEntityId: string;
    entityName: string;
    entityType: string;
    createdBy: string;
    code: string;
    name: string;
    id: string;
}

export interface Organization {
    code: string;
    address: string;
    dashboardDefaultView: string;
    mobile: number;
    languageId: string;
    pageSize: number;
    translationType: string;
    grid: string;
    timeFormat: string;
    isNull: string;
    name: string;
    id: string;
    expiry: Date;
    live: string;
    SystemLanguage: SystemLanguage;
}

export interface AppSetting {
    dashboardDefaultView: string;
    languageId: string;
    pageSize: number;
    translationType: boolean;
    timeFormat: string;
    isNull: string;
    id: string;
    enableGrid: boolean;
    live: string;
    SystemLanguage: SystemLanguage;
}

export interface Context {
    Organization: Organization[];
    AppSetting: AppSetting[];
}

export interface ApplicationContext {
    context: any;
}

export interface Process {
    processId: string;
    processName: string;
    id: string;
}

export interface Role {
    roleId: string;
    roleName: string;
    id: string;
    Process: Process[];
}

export interface User {
    userdomain: string;
    password: string;
    phone: string;
    isactive: string;
    userEmail: string;
    id: string;
    userName: string;
    userId: string;
    Role: Role[];
}

export interface UserSetting {
    languageId: string;
    pageSize: number;
    userId: string;
    timeFormat: string;
    id: string;
    User: User;
    SystemLanguage: SystemLanguage;
}

export interface UserContext {
    context: Context;
}

export type AppAndUserContext = {
    applicationContext: ApplicationContext;
    userContext: UserContext;
}

