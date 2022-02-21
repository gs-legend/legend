import apiClient from 'core/services/ApiClient';
import dataService from 'core/DataService';

export default {
    viewDocument: (payload: any) => apiClient.post(dataService.BASE_URL + 'dms/viewDocument', payload, { withCredentials: true }),
};
