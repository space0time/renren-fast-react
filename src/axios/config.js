/**
 * Created by 叶子 on 2017/7/30.
 * 接口地址配置文件
 */

//easy-mock模拟数据接口地址
const EASY_MOCK = 'https://www.easy-mock.com/mock';
// const EASY_MOCK = 'http://localhost:3006/mock';
const MOCK_AUTH = EASY_MOCK + '/597b5ed9a1d30433d8411456/auth'; // 权限接口地址
export const MOCK_AUTH_ADMIN = MOCK_AUTH + '/admin'; // 管理员权限接口
export const MOCK_AUTH_VISITOR = MOCK_AUTH + '/visitor' // 访问权限接口



export const SERVER_URL = process.env.NODE_ENV === 'production'?'http://172.24.86.241:8080/renren-fast':'http://localhost:8080/renren-fast';
export const CAPTCHA_URL = SERVER_URL + '/captcha.jpg?uuid=';
export const LOGIN_URL = SERVER_URL + '/sys/login';
export const MENU_URL = SERVER_URL + '/sys/menu/nav';
export const USER_INFO = SERVER_URL + '/sys/user/info';


