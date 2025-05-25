import axios from 'axios';

const API_BASE_URL = 'http://localhost:5006';

const api = {
    // Get dashboard data
    getDashboardData: async () => {
        try {
            console.log('Fetching dashboard data from:', `${API_BASE_URL}/api/dashboard-data`);
            const [dashboardResponse, transactionsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/dashboard-data`),
                axios.get(`${API_BASE_URL}/api/transactions`)
            ]);
            
            console.log('Dashboard response:', dashboardResponse.data);
            console.log('Transactions response:', transactionsResponse.data);

            // Transform the data to match our expected structure
            const transformedData = {
                total_volume: Number(dashboardResponse.data.total_volume || 0),
                transaction_count: Number(dashboardResponse.data.total_transactions || 0),
                avg_transaction: Number(dashboardResponse.data.total_volume || 0) / 
                               (Number(dashboardResponse.data.total_transactions) || 1),
                fraud_count: Number(dashboardResponse.data.anomaly_count || 0),
                transactions: Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []
            };

            console.log('Transformed data:', transformedData);
            return transformedData;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(`Server error: ${error.response.data.message || error.message}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('No response from server. Please check if the backend is running.');
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    },

    // Get recent transactions
    getTransactions: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/transactions`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    // Get token balances for an address
    getTokenBalances: async (address) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/token-balances/${address}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching token balances:', error);
            throw error;
        }
    }
};

export default api;
