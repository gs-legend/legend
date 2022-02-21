import { usePromiseTracker } from 'react-promise-tracker';

export const useTrackProgress = (id?: string) => usePromiseTracker({ area: id, delay: 300 }).promiseInProgress;

export { trackPromise as trackProgress } from 'react-promise-tracker';
