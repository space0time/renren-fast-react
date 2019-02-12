/**
 * Created by hao.cheng on 2017/4/13.
 */
import React, {Component} from 'react';
import {Badge, Icon, Layout, Menu, Modal, Popover} from 'antd';
import screenfull from 'screenfull';
import avater from '../style/imgs/b1.jpg';
import SiderCustom from './SiderCustom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {PwaInstaller} from './widget';
import ModifyPassword from './ModifyPassword'

const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class HeaderCustom extends Component {
    state = {
        user: '',
        visible: false,
        mpVisible: false,
    };
    componentDidMount() {
        /*const _user = JSON.parse(sessionStorage.getItem('user'));
        this.setState({
            user: _user
        });*/
    };
    componentWillReceiveProps(nextProps){
        this.setState({
            user:nextProps.user,
        });
    }
    screenFull = () => {
        if (screenfull.enabled) {
            screenfull.request();
        }

    };
    menuClick = e => {
        console.log(e);
        e.key === 'logout' && this.logout();

        e.key === 'setting:2' && this.handleMpVisibleChange(true);
    };
    logout = () => {
        Modal.confirm({
            title:'提示',
            content: '确认退出吗?',
            onOk:()=>{
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('permissions');
                sessionStorage.removeItem('menuList');
                sessionStorage.removeItem('token');
                this.props.history.push('/login');
            }
        });
    };
    popoverHide = () => {
        this.setState({
            visible: false,
        });
    };
    handleVisibleChange = (visible) => {
        this.setState({ visible });
    };

    handleMpVisibleChange = (mpVisible) => {
        this.setState({ mpVisible });
    };

    render() {
        const { responsive, path, user } = this.props;
        return (
            <Header className="custom-theme header" >
                {
                    responsive.data.isMobile ? (
                        <Popover content={<SiderCustom path={path} popoverHide={this.popoverHide} />} trigger="click" placement="bottomLeft" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
                            <Icon type="bars" className="header__trigger custom-trigger" />
                        </Popover>
                    ) : (
                        <Icon
                            className="header__trigger custom-trigger"
                            type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.props.toggle}
                        />
                    )
                }
                <Menu
                    mode="horizontal"
                    style={{ lineHeight: '64px', float: 'right' }}
                    onClick={this.menuClick}
                >
                    {/*<Menu.Item key="pwa">
                        <PwaInstaller />
                    </Menu.Item>*/}
                    <Menu.Item key="full" onClick={this.screenFull} >
                        <Icon type="arrows-alt" onClick={this.screenFull} />
                    </Menu.Item>
                    <Menu.Item key="1">
                        <Badge count={25} overflowCount={10} style={{marginLeft: 10}}>
                            <Icon type="notification" />
                        </Badge>
                    </Menu.Item>
                    <SubMenu title={<span className="avatar"><img src={avater} alt="头像" /><i className="on bottom b-white" /></span>}>
                        <MenuItemGroup title="用户中心">
                            <Menu.Item key="setting:1">你好 - {user.username}</Menu.Item>
                            <Menu.Item key="setting:2">修改密码</Menu.Item>
                            <Menu.Item key="logout"><span >退出登录</span></Menu.Item>
                        </MenuItemGroup>
                    </SubMenu>
                </Menu>
                <ModifyPassword
                    visible={this.state.mpVisible}
                    handleMpVisibleChange={this.handleMpVisibleChange}
                    username={this.state.user.username}
                />
            </Header>
        )
    }
}

const mapStateToProps = state => {
    const { responsive = {data: {}} } = state.httpData;
    return {responsive};
};

export default withRouter(connect(mapStateToProps)(HeaderCustom));
