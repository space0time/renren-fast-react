import React, {Component} from 'react';
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Input, Modal, notification, Row, Table, Tag} from "antd";
import {Redirect} from "react-router-dom";
import UserAddOrUpdate from "./userAddOrUpdate";
import {get, post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

class sysUser extends Component {
    state = {
        selectedRowKeys: [],
        loading: false,
        queryInfo: {//设置最初一页显示多少条
            pageSize: 10
        },
        dataSource: {//数据存放
            count: 0,//一共几条数据
            data: [],//数据
        },
        username: '',//查询条件
        needLogin: false,
        showModal: false,
        editUserId: null,
        userData: {},
        roleList: [],
    };
    componentDidMount() {
        this.start();

        get({url:SERVER_URL+'/sys/role/select'}).then(res=>{
            if(res.code === 0){
                this.setState({
                    roleList:res.list
                });
            }
        })
    }

    /**
     * 加载表格数据
     * @param page
     * @param num
     */
    start = (page=1,num) => {
        this.setState({ loading: true });
        const limit = num?num:this.state.queryInfo.pageSize;

        get({url:SERVER_URL + '/sys/user/list',
            headers:{params:{page: page, limit: limit, username: this.state.username}}}).then(res => {
            const {code, msg, page} = res;
            if(code !== 0){
                notification['error']({
                    message:msg
                });
                this.setState({
                    needLogin: true
                });
                return ;
            }
            this.setState({
                dataSource:{
                    data: [...page.list.map(val => {
                        val.key = val.userId;
                        return val;
                    })],
                    count: page.totalCount
                },
                queryInfo : {
                    pageSize: limit
                },
                loading: false
            });
        });
    };

    /**
     * 定义表格列
     * @returns {*[]}
     */
    getColumn = () => {
        return [{
            title: 'Id',
            dataIndex: 'userId',
            width: 20
        }, {
            title: '用户名',
            dataIndex: 'username',
            width: 80
        }, {
            title: '邮箱',
            dataIndex: 'email',
            width: 80
        }, {
            title: '手机号',
            dataIndex: 'mobile',
            width: 80
        }, {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (text) => {
                const tag = text === 0 ? '禁用' : '正常';
                const color = text === 0 ? 'red' : 'blue';
                return <Tag color={color} key={tag}>{tag}</Tag>
            }
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            width: 80
        }, {
            title: '操作',
            dataIndex: '',
            width: 100,
            render: (text, record) => (
                <span>
                    <Button size={"small"} type="primary" onClick={()=>this.editUser(record)}>修改</Button>
                    <Button size={"small"} type="danger" onClick={()=>this.deleteUser(record)}>删除</Button>
                </span>
            )
        }]
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    /**
     * 查询框输入
     * @param e
     */
    usernameInput = (e) =>{
        this.setState({
            username:e.target.value
        });
    }

    /**
     * 添加用户
     */
    addUser = ()=>{
        this.setState({
            showModal: true,
            editUserId: null,
            userData:{}
        });
    }

    /**
     * 子组件点击取消
     */
    cancelAdd = ()=>{
        this.setState({
            showModal: false,
            editUserId: null,
            userData:{}
        });
    }

    /**
     * 保存用户成功
     */
    saveUserSuccess = ()=>{
        this.setState({
            showModal: false,
            editUserId: null,
            userData:{}
        });
        this.start();
    }

    /**
     * 编辑用户
     */
    editUser = (record) => {
        get({url:SERVER_URL+`/sys/user/info/${record.userId}`}).then(res => {
            if(res.code === 0){
                delete res.user.password;
                this.setState({
                    showModal: true,
                    editUserId: record.userId,
                    userData: res.user
                });
            }
        })
    }

    /**
     * 删除用户
     */
    deleteUser= (record) => {
        Modal.confirm({
            title:`确认删除用户${record.username}?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+'/sys/user/delete',
                    data:[record.userId],
                    headers:{headers: {"Content-Type": "application/json"}}
                }).then( res => {
                    const {code, msg} = res;
                    if(code !== 0){
                        Modal.error({title:msg});
                    }else{
                        Modal.success({title:'删除成功'});
                        this.start();
                    }
                });
            }
        });
    }

    /**
     * 批量删除用户
     */
    deleteUsers = () => {
        Modal.confirm({
            title:`确认删除选择的用户?`,
            onOk:()=>{
                post({url:SERVER_URL+'/sys/user/delete',
                    data:this.state.selectedRowKeys,
                    headers:{headers: {"Content-Type": "application/json"}}
                }).then( res => {
                    const {code, msg} = res;
                    if(code !== 0){
                        Modal.error({title:msg});
                    }else{
                        Modal.success({title:'删除成功'});
                        this.start();
                    }
                });
            }
        });
    }


    render() {
        const { selectedRowKeys, needLogin } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        if(needLogin){
            return <Redirect to="/login" />
        }
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="系统管理" second="管理员列表" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Input placeholder="用户名"
                                           style={{ width: 200 , marginRight: '15px'}}
                                           value={this.state.username}
                                           onChange={this.usernameInput}
                                           onPressEnter={() => this.start()}
                                    />
                                    <Button type="default" onClick={()=>this.start()} >查询</Button>
                                    <Button type="primary" onClick={this.addUser}>新增</Button>
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={this.deleteUsers}
                                    >
                                        批量删除
                                    </Button>
                                </div>
                                <Table rowSelection={rowSelection}
                                       columns={this.getColumn()}
                                       dataSource={this.state.dataSource.data}
                                       pagination={{//分页
                                           total: this.state.dataSource.count,//数据总数量
                                           pageSize: this.state.queryInfo.pageSize,//显示几条一页
                                           defaultPageSize: this.state.queryInfo.pageSize,//默认显示几条一页
                                           showSizeChanger: true,//是否显示可以设置几条一页的选项
                                           onShowSizeChange:(current, pageSize)=>{//当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                                                this.start(current, pageSize); //这边已经设置了self = this
                                           },
                                           onChange:(current)=>{//点击改变页数的选项时调用函数，current:将要跳转的页数
                                               this.start(current);
                                           },
                                           showTotal:() =>{//设置显示一共几条数据
                                               return '共 ' + this.state.dataSource.count + ' 条';
                                           }
                                       }}
                                       loading={this.state.loading}
                                />
                            </Card>
                        </div>
                    </Col>
                </Row>
                <UserAddOrUpdate
                    visible={this.state.showModal}
                    userId = {this.state.editUserId}
                    userData = {this.state.userData}
                    roleList = {this.state.roleList}
                    cancelAdd={this.cancelAdd}
                    saveUserSuccess={this.saveUserSuccess}
                />
            </div>
        )
    }
}


export default sysUser;
