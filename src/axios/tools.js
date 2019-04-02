/**
 * Created by 叶子 on 2017/7/30.
 * http通用工具函数
 */
import axios from 'axios';
import { message, notification } from 'antd';
import {SERVER_URL} from './config'
import {HashRouter} from 'react-router-dom'

const router = new HashRouter();


axios.defaults.baseURL = SERVER_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 请求的拦截器
axios.interceptors.request.use(function (config) {
    const token = sessionStorage.getItem('token');

    let headers = config.headers;
    config.headers = {
        token: token,
        ...headers
    }

    return config;
}, function (error) {
    return Promise.reject(error);
})

/**
 * 公用get请求
 * @param url       接口地址
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const get = ({url, msg = '接口异常', headers}) =>  axios.get(url, headers).then(res => {
        if(res.data && res.data.code===401){
            notification['error']({
                message:res.data.msg
            });
            sessionStorage.clear();
            localStorage.clear();
            router.history.push('/login');
        }
        return res.data
    }).catch(err => {
       console.log(err);
       message.warn(msg);
       if(err.data && err.data.code===401){
            sessionStorage.clear();
            localStorage.clear();
            router.history.push('/login');
       }
    });

/**
 * 公用post请求
 * @param url       接口地址
 * @param data      接口参数
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const post = ({url, data, msg = '接口异常', headers}) =>  axios.post(url, data, headers).then(res => {
    if(res.data && res.data.code===401){
        notification['error']({
            message:res.data.msg
        });
        sessionStorage.clear();
        localStorage.clear();
        router.history.push('/login');
    }
    return res.data
}).catch(err => {
        console.log(err);
        message.warn(msg);
        if(err.data && err.data.code===401){
            sessionStorage.clear();
            localStorage.clear();
            router.history.push('/login');
       }
    });
