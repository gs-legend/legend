import { selectWindowId } from "../services/auth";
import { store } from "../store";
import { v4 as uuidv4 } from 'uuid';
import { IRuntimeInput, IVerbProperties } from "core/Interfaces";

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

export const createLoadRequest = (process: string, tabId: string) => {
  const windowId = selectWindowId(store.getState());
  return {
    event: { processName: process },
    fromUi: true,
    windowId: windowId,
    guid: tabId,
    uiEvent: {
      uiEventName: 'ONLOAD',
      uiEventType: null,
      uiEventValue: ""
    },
    inputData: {
      detailedObjects: {} as any,
      changeFor: {} as any,
      processName: process,
      verbProperties: {},
      properties: {
        fromUI: true,
        windowId: windowId,
        guid: tabId,
      }
    }
  }
}

export const createSearchRequest = (processName: string, presentationId: string, tabId: string, runtimeInput: IRuntimeInput, pageNumber: number) => {
  const windowId = selectWindowId(store.getState());

  return {
    event: { processName: processName },
    fromUi: true,
    windowId: windowId,
    guid: tabId,
    uiEvent: {
      uiEventName: 'SEARCH',
      uiEventValue: presentationId + '_Global_onSearch',
      uiEventType: null
    },
    inputData: {
      detailedObjects: {
        RuntimeInput: [runtimeInput]
      },
      processName: processName,
      verbProperties: { pageNumber: pageNumber },
      properties: {
        fromUI: true,
        windowId: windowId,
        guid: tabId
      }
    }
  };
};

export const createChangeRequest = (processName, attributeName, presentationId, guid) => {
  const windowId = selectWindowId(store.getState());
  return {
    event: { processName: processName },
    fromUi: true,
    windowId: windowId,
    guid: guid,
    uiEvent: {
      uiEventName: 'ONCHANGE',
      uiEventValue: presentationId + "_" + attributeName + "_onChange",
      uiEventType: null
    },
    inputData: {
      processName: processName,
      detailedObjects: {},
      changeFor: {},
      verbProperties: {},
      properties: {
        fromUI: true,
        windowId: windowId,
        guid: guid,
      }
    },
  };
};

export const createOnClickRequest = (processName, guid) => {
  const windowId = selectWindowId(store.getState());
  return {
    event: { processName: processName },
    fromUi: true,
    windowId: windowId,
    guid: guid,
    uiEvent: {
      uiEventName: 'ONCLICK',
      uiEventType: null
    },
    inputData: {
      processName: processName,
      detailedObjects: {},
      verbProperties: {},
      properties: {
        fromUI: true,
        windowId: windowId,
        guid: guid,
      }
    }
  };
};

export const newId = () => {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16)
}

export const generateGUID = () => {
  return uuidv4();
};
