import { selectWindowId } from "../services/auth";
import { store } from "../store";
import { v4 as uuidv4 } from 'uuid';

export const createStartRequest = (processName: string, tabId: string) => {
  const windowId = selectWindowId(store.getState());
  return {
    event: { processName: processName },
    fromUi: true,
    windowId: windowId,
    guid: tabId,
    uiEvent: {
      uiEventName: 'START',
      uiEventType: null,
      uiEventValue: 'start'
    },
    inputData: {
      processName: processName,
      nextStepToBeexecuted: null,
      detailedObjects: {} as any,
      verbProperties: {},
      previousProcessName: undefined,
      properties: {
        fromUI: true,
        windowId: windowId,
        guid: tabId,
      }
    }
  };
};

export const createLoadRequest = (process: string) => {
  return {
    event: { processName: process },
    fromUi: true,
    windowId: window.sessionStorage.WINDOWID,
    guid: window.sessionStorage.GUID,
    uiEvent: {
      uiEventName: 'ONLOAD',
      uiEventType: null,
      uiEventValue: ""
    },
    inputData: {
      processName: process,
      detailedObjects: {} as any,
      changeFor: {} as any,
      verbProperties: {},
      properties: {
        fromUI: true,
        windowId: window.sessionStorage.WINDOWID,
        guid: window.sessionStorage.GUID,
      }
    }
  }
}

export const newId = () => {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16)
}

export const generateGUID = () => {
  return uuidv4();
};