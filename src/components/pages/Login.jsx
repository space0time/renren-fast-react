/**
 * Created by hao.cheng on 2017/4/16.
 */
import React from 'react';
import { Form, Icon, Input, Button, Checkbox, notification} from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchData, receiveData } from '@/action';
import { PwaInstaller } from '../widget';
import {getUUID} from "../../utils";
import {CAPTCHA_URL} from '../../axios/config';

const FormItem = Form.Item;

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uuid: getUUID()
        };
    }
    componentWillMount() {
        // const { receiveData } = this.props;
        // console.log(receiveData(null, 'auth'));
        // console.log(this.props)
    }
    componentDidUpdate(prevProps) { // React 16.3+弃用componentWillReceiveProps
        const { auth: nextAuth = {}, history } = this.props;
        // const { history } = this.props;
        if (nextAuth.data && nextAuth.data.userId) { // 判断是否登陆
            sessionStorage.setItem('user', JSON.stringify(nextAuth.data));
             history.push('/');
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const { fetchData } = this.props;
                // if (values.userName === 'admin' && values.password === 'admin') fetchData({funcName: 'admin', stateName: 'auth'});
                // if (values.userName === 'guest' && values.password === 'guest') fetchData({funcName: 'guest', stateName: 'auth'});
                fetchData({funcName: 'login', params: {...values, uuid: this.state.uuid}}).then(res =>{
                    if(res.data && res.data.code===0) {
                        const token = res.data.token;
                        sessionStorage.setItem("token", token);
                        fetchData({funcName:'getMenu',params:{token}}).then(rs => {
                            sessionStorage.setItem('permissions',JSON.stringify(rs.data.permissions));
                            sessionStorage.setItem('menuList',JSON.stringify(rs.data.menuList));
                            fetchData({funcName:'userInfo',params:{token}});
                        })
                    }else if(res.data && res.data.code && res.data.code!==0){
                        this.refreshCaptcha();
                        notification['error']({
                            message:res.data.msg
                        });
                    }
                });
            }
        });
    };
    refreshCaptcha = () => {
        const uuid = getUUID();
        this.setState({uuid});
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login">
                <div className="login-form" >
                    <div className="login-logo">
                        <span>React Admin</span>
                        {/*<PwaInstaller />*/}
                    </div>
                    <Form onSubmit={this.handleSubmit} style={{maxWidth: '300px'}}>
                        <FormItem>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: '请输入用户名!' }],
                            })(
                                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="账号" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }],
                            })(
                                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
                            )}
                        </FormItem>
                        <FormItem>
                            <Input.Group >
                                {getFieldDecorator('captcha',{
                                    rules:[{required: true, message: '请输入验证码'}],
                                })(
                                    <Input style={{width:'50%'}} placeholder="验证码" />
                                )}
                                <img style={{width:'50%'}} onClick={this.refreshCaptcha} src={CAPTCHA_URL+this.state.uuid} alt="点击刷新" />
                            </Input.Group>
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(
                                <Checkbox>记住我</Checkbox>
                            )}
                            <span className="login-form-forgot" href="" style={{float: 'right'}}>忘记密码</span>
                            <Button type="primary" htmlType="submit" className="login-form-button" style={{width: '100%'}}>
                                登录
                            </Button>
                            <p style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span >或 现在就去注册!</span>
                            </p>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }
}

const mapStateToPorps = state => {
    const defaultLogin = {data:{}};
    const defaultGetMenu = {data:{}};
    const defaultUserInfo = {data:{}};
    const { login=defaultLogin, getMenu=defaultGetMenu, userInfo=defaultUserInfo} = state.httpData;
    return { auth : {data:{
                        ...userInfo.data.user,
                        permissions:getMenu.data.permissions,
                        menuList:getMenu.data.menuList}} ,
        token:login.data.token,
        };
};
const mapDispatchToProps = dispatch => ({
    fetchData: bindActionCreators(fetchData, dispatch),
    receiveData: bindActionCreators(receiveData, dispatch)
});


export default connect(mapStateToPorps, mapDispatchToProps)(Form.create()(Login));
