
export const AUTH_ROUTE_PREFIX = '/auth';

export const AUTH_ROUTER_PATHS = {
  login: `${AUTH_ROUTE_PREFIX}/login`,
  logout: `${AUTH_ROUTE_PREFIX}/logout`,
  forgottenPassword: `${AUTH_ROUTE_PREFIX}/forgotten-password`
};

export const HTML_CONTROLS = {
  MULTISELECT: "multiselect",
  DATE: 'date',
  DATETIME: 'dateTime',
  TIME: 'time',
  TREESELECT: 'treeSelect',
  IMAGE: 'image',
  PREVIEW: 'preview',
  FILE: 'file',
  SEARCH: 'search',
  RADIO: 'radio',
  SELECT: 'select',
  TEXT: 'text',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  CURRENCY: 'currency',
  ACTIVITY: 'activity',
  COMMENTS: 'comments',
  CUSTOMACTIVITYLOG: 'customactivitylog',
  CHECKLIST: 'checklist'
}

export const PRESENTATION_TYPES = {
  REPORT: 'REPORT'
}

export const DATA_CONSTANTS = {
  NO_DATA_TEXT: '---',
}

export const CONSTANTS = {
  EMPTY: "",
  ID: "id",
  RuntimeInput: "RuntimeInput",
  DEFAULT: "DEFAULT",
  PREV: "prev",
  NEXT: "next",
  PAGENUMBER: 'pageNumber',
  PAGESIZE: 'pageSize',
  BYMEFORME: 'byMeForMe',
  PRULE_TYPE: "@type",
  REMOVED: "removed_",
  ERROR_MSG: "An error occurred."
}

export const PRESENTATIONRULE_TYPES = {
  FIELDPRESENTATION: "FieldPresentation",
  NONFIELDPRESENTATION: "NonFieldPresentation",
  SECTIONPRESENTATION: "SectionPresentation",
  FORMPRESENTATION: "FormPresentation"
}

export const NONFIELDPRESENTATION_TYPES = {
  PARAGRAPH: "PARAGRAPH",
  HEADER: "HEADER",
  HYPERLINK: "HYPERLINK",
  LINE_BREAK: "LINE_BREAK",
  BUTTON: "BUTTON",
  REPORT: "REPORT"
}
