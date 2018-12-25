import React, { Component } from 'react';
import { Layout } from 'antd';
import SiderCustom from './components/SiderCustom';
import HeaderCustom from './components/HeaderCustom';
import { fetchData, receiveData } from './action';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Routes from './routes';
import { ThemePicker } from './components/widget';
import {isURL} from "./utils";
import routes from "./routes/config";
import {Redirect} from "react-router-dom";

const { Content, Footer } = Layout;

class App extends Component {
    static transMenu(list){
        return list?list.map(v => {
            let subs = null;
            if(v.list){
                subs = App.transMenu(v.list);
            }
            let rs = {key: '/app/' + v.url, title: v.name, icon: v.icon};
            if(subs){
                rs.subs = subs;
            }
            if(isURL(v.url)){
                rs.url = v.url;
                rs.route = '/app/' + v.menuId;
            }
            return rs;
        }):null;
    }
    state = {
        collapsed: false,
    };
    componentWillMount() {
        const { receiveData, fetchData } = this.props;
        const user = JSON.parse(localStorage.getItem('user'));
        if(user) {
            const menuList = user.menuList;
            const menus = App.transMenu(menuList);
            const newMenu = menus?menus.concat(routes.menus):[];
            user.menuList = newMenu;
            receiveData(user, 'auth');
        }
        const token = sessionStorage.getItem("token");
        fetchData({funcName:'getMenu',params:{token}});

        // user && receiveData(user, 'auth');
        // receiveData({a: 213}, 'auth');
        // fetchData({funcName: 'admin', stateName: 'auth'});
        this.getClientWidth();
        window.onresize = () => {
            this.getClientWidth();
        }
    }
    componentDidMount() {
        /*const openNotification = () => {
            notification.open({
              message: '博主-yezihaohao',
              description: (
                  <div>
                      <p>
                          GitHub地址： <a href="https://github.com/yezihaohao" target="_blank" rel="noopener noreferrer">https://github.com/yezihaohao</a>
                      </p>
                      <p>
                          博客地址： <a href="https://yezihaohao.github.io/" target="_blank" rel="noopener noreferrer">https://yezihaohao.github.io/</a>
                      </p>
                  </div>
              ),
              icon: <Icon type="smile-circle" style={{ color: 'red' }} />,
              duration: 0,
            });
            localStorage.setItem('isFirst', JSON.stringify(true));
        };
        const isFirst = JSON.parse(localStorage.getItem('isFirst'));
        !isFirst && openNotification();*/
    }
    getClientWidth = () => { // 获取当前浏览器宽度并设置responsive管理响应式
        const { receiveData } = this.props;
        const clientWidth = window.innerWidth;
        receiveData({isMobile: clientWidth <= 992}, 'responsive');
    };
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    render() {
        const { auth, responsive } = this.props;

        const token = sessionStorage.getItem("token");
        if(!token){
            return <Redirect to={'/login'} />;
        }

        return (
            <Layout>
                {!responsive.data.isMobile && <SiderCustom collapsed={this.state.collapsed} auth={auth} />}
                <ThemePicker />
                <Layout style={{flexDirection: 'column'}}>
                    <HeaderCustom toggle={this.toggle} collapsed={this.state.collapsed} user={auth.data || {}} />
                    <Content style={{ margin: '0 16px', overflow: 'initial', flex: '1 1 0' }}>
                        <Routes auth={auth} />
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                    React-Admin ©{new Date().getFullYear()} Created by 865470087@qq.com
                    </Footer>
                </Layout>

                {/* {
                    responsive.data.isMobile && (   // 手机端对滚动很慢的处理
                        <style>
                        {`
                            #root{
                                height: auto;
                            }
                        `}
                        </style>
                    )
                } */}
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    const { auth = {data: {}}, responsive = {data: {}} ,getMenu = {data: {}}} = state.httpData;

    const menus = App.transMenu(getMenu.data.menuList);
    if(menus) {
        const newMenu = menus?menus.concat(routes.menus):[];
        auth.data.menuList = newMenu;
    }

    return {auth, responsive, menuList:getMenu.data.menuList};
};
const mapDispatchToProps = dispatch => ({
    fetchData: bindActionCreators(fetchData, dispatch),
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
