import React, { Component } from 'react'
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Input, Modal, notification, Row, Table} from "antd";
import {get, post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import {Redirect} from "react-router-dom";
import RoleAddOrUpdate from "./roleAddOrUpdate"
import {isAuth} from '@/utils'

class sysRole extends Component {

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
        roleName: '',//查询条件
        showModal: false,
        editRoleId: null,
        roleData: {},
    };

    componentDidMount() {
        this.start();
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    /**
     * 加载表格数据
     * @param page
     * @param num
     */
    start = (page=1,num) => {
        this.setState({ loading: true });
        const limit = num?num:this.state.queryInfo.pageSize;

        get({url: '/sys/role/list',
            headers:{params:{page: page, limit: limit, roleName: this.state.roleName}}}).then(res => {
            const {code, msg, page} = res;
            if(code !== 0){
                notification['error']({
                    message:msg
                });
                return ;
            }
            this.setState({
                dataSource:{
                    data: [...page.list.map(val => {
                        val.key = val.roleId;
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
            dataIndex: 'roleId',
            width: 20
        }, {
            title: '角色名称',
            dataIndex: 'roleName',
            width: 80
        }, {
            title: '所属部门',
            dataIndex: 'deptName',
            width: 80
        }, {
            title: '备注',
            dataIndex: 'remark',
            width: 80
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
                    {isAuth('sys:role:update') &&(
                    <Button size={"small"} type="primary" onClick={()=>this.editRole(record)}>修改</Button>
                    )}
                    {isAuth('sys:role:delete') &&(
                    <Button size={"small"} type="danger" onClick={()=>this.deleteRole(record)}>删除</Button>
                    )}
                </span>
            )
        }]
    }

    /**
     * 查询框输入
     * @param e
     */
    roleNameInput = (e) =>{
        this.setState({
            roleName:e.target.value
        });
    }

    /**
     * 添加角色
     */
    addRole = ()=>{
        this.setState({
            showModal: true,
            editRoleId: null,
            roleData:{}
        });
    }

    /**
     * 子组件点击取消
     */
    cancelAdd = ()=>{
        this.setState({
            showModal: false,
            editRoleId: null,
            roleData:{}
        });
    }

    /**
     * 保存角色成功
     */
    saveSuccess = ()=>{
        this.setState({
            showModal: false,
            editRoleId: null,
            roleData:{}
        });
        this.start();
    }

    /**
     * 编辑角色
     */
    editRole = (record) => {
        get({url:`/sys/role/info/${record.roleId}`}).then(res => {
            if(res.code === 0){
                this.setState({
                    showModal: true,
                    editRoleId: record.roleId,
                    roleData: res.role
                });
            }
        })
    }

    /**
     * 删除角色
     */
    deleteRole= (record) => {
        Modal.confirm({
            title:`确认删除角色${record.roleName}?`,
            content:'',
            onOk:()=>{
                post({url:'/sys/role/delete',
                    data:[record.roleId],
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
     * 批量删除角色
     */
    deleteRoles = () => {
        Modal.confirm({
            title:`确认删除选择的角色?`,
            onOk:()=>{
                post({url:'/sys/role/delete',
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

    render(){
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="系统管理" second="角色管理" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Input placeholder="角色名"
                                           style={{ width: 200 , marginRight: '15px'}}
                                           value={this.state.roleName}
                                           onChange={this.roleNameInput}
                                           onPressEnter={() => this.start()}
                                    />
                                    <Button type="default" onClick={()=>this.start()} >查询</Button>
                                    {isAuth('sys:role:save') &&(
                                    <Button type="primary" onClick={this.addRole}>新增</Button>
                                    )}
                                    {isAuth('sys:role:delete') &&(
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={this.deleteRoles}
                                    >
                                        批量删除
                                    </Button>
                                    )}
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
                <RoleAddOrUpdate
                    visible={this.state.showModal}
                    roleId = {this.state.editRoleId}
                    roleData = {this.state.roleData}
                    cancelAdd={this.cancelAdd}
                    saveSuccess={this.saveSuccess}

                />
            </div>
        )
    }
}

export default sysRole;
