/**
 * Created by 叶子 on 2017/7/30.
 * http通用工具函数
 */
import axios from 'axios';
import { message } from 'antd';

/**
 * 公用get请求
 * @param url       接口地址
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const get = ({url, msg = '接口异常', headers}) => {
    let header = {};
    if(headers && headers.headers) {
        header = JSON.parse(JSON.stringify(headers))
        header.headers.token = sessionStorage.getItem('token');

    }else{
        header = headers?JSON.parse(JSON.stringify(headers)):{};
        header.headers = {token:sessionStorage.getItem('token')}
    }
    return axios.get(url, header).then(res => res.data).catch(err => {
       console.log(err);
       message.warn(msg);
    })
};

/**
 * 公用post请求
 * @param url       接口地址
 * @param data      接口参数
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const post = ({url, data, msg = '接口异常', headers}) => {
    let header = {};
    if(headers && headers.headers) {
        header = JSON.parse(JSON.stringify(headers))
        header.headers.token = sessionStorage.getItem('token');

    }else{
        header.headers = {token:sessionStorage.getItem('token')}
    }
    return axios.post(url, data, header).then(res => res.data).catch(err => {
        console.log(err);
        message.warn(msg);
    })
};
