import apiClient from 'core/services/apiClient';
import dataService from 'core/data.service';

export default {
    viewDocument: (payload: any) => apiClient.post(dataService.BASE_URL + 'dms/viewDocument', payload, { withCredentials: true }),
};
