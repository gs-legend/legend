class DataService {
    BASE_URL: string;

    constructor() {
        this.BASE_URL = "http://localhost:7777/";
        this.BASE_URL = "https://dev3.kagamierp.com:12001/kagami-generated_Pagon/";
    }
}

export default new DataService();