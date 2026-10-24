import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8081/api',
    withCredentials: true
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

let refreshing = false
let queue = []

api.interceptors.response.use(
    res => res,
    async err => {
        const original = err.config
        if ((err.response?.status === 401 || err.response?.status === 403) && !original._retry) {
            if (refreshing) {
                return new Promise((resolve, reject) => {
                    queue.push({ resolve, reject })
                }).then(() => api(original))
            }
            original._retry = true
            refreshing = true
            try {
                const res = await axios.post('http://localhost:8081/api/auth/refresh', {}, { withCredentials: true })
                const newToken = res.data.accessToken
                localStorage.setItem('token', newToken)
                if (res.data.role) localStorage.setItem('role', res.data.role)
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                queue.forEach(p => p.resolve())
                queue = []
                original.headers['Authorization'] = `Bearer ${newToken}`
                return api(original)
            } catch {
                queue.forEach(p => p.reject())
                queue = []
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                localStorage.removeItem('userId')
                window.location.href = '/login'
            } finally {
                refreshing = false
            }
        }
        return Promise.reject(err)
    }
)

export default api