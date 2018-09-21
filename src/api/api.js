import Axios from 'axios';

let base = '/api';

const MyAxios = Axios.create({
    transformRequest: [function (data) {
        // 将数据转换为表单数据
        let ret = ''
        for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
    }],
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

export const requestLogin = params => { return MyAxios.post(`${base}/login`, params).then(res => res.data); };

export const getUserList = params => { return MyAxios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return MyAxios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return MyAxios.delete(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return MyAxios.post(`${base}/user/batchremove`, params ); };

export const editUser = params => { return MyAxios.post(`${base}/user/edit`, params); };

export const addUser = params => { return MyAxios.put(`${base}/user/add`, params); };

export const getPatchListPage = params => { return MyAxios.get(`${base}/patch/listpage`, { params: params }); };
