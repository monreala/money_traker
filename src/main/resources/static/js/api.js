/**
 * API Client for Money Tracker
 */
const API = {
    BASE: '',

    async request(url, options = {}) {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        };

        try {
            const response = await fetch(this.BASE + url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);
            throw error;
        }
    },

    // === Categories ===
    getCategories() {
        return this.request('/api/categories');
    },

    getCategoryById(id) {
        return this.request(`/api/categories/${id}`);
    },

    createCategory(data) {
        return this.request('/api/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateCategory(id, data) {
        return this.request(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteCategory(id) {
        return this.request(`/api/categories/${id}`, {
            method: 'DELETE',
        });
    },

    // === Transactions ===
    getTransactions(params = {}) {
        const query = new URLSearchParams();
        if (params.type) query.set('type', params.type);
        if (params.from) query.set('from', params.from);
        if (params.to) query.set('to', params.to);
        const qs = query.toString();
        return this.request(`/api/transactions${qs ? '?' + qs : ''}`);
    },

    getTransactionById(id) {
        return this.request(`/api/transactions/${id}`);
    },

    createTransaction(data) {
        return this.request('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateTransaction(id, data) {
        return this.request(`/api/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteTransaction(id) {
        return this.request(`/api/transactions/${id}`, {
            method: 'DELETE',
        });
    },

    // === Summary ===
    getSummary() {
        return this.request('/api/transactions/summary');
    },
};

