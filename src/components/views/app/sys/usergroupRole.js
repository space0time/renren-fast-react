import React, {Component} from 'react';
import {Button, Card, Col, Input, Modal, notification, Row, Table} from "antd";
import {Link, Redirect} from "react-router-dom";
import {get, post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {isAuth} from '@/utils'
import UsergourpRoleAdd from "./usergroupRoleAdd"

class UsergroupRole extends Component {
    state = {
        ugId: null,
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
        editUgId: null,
        usergroupData: {},
    };

    componentDidMount() {
        this.setState({
            ugId: this.props.match.params.ugId
        })

        this.start();
    }

    /**
     * 加载表格数据
     * @param page
     * @param num
     */
    start = (page=1,num) => {
        this.setState({ selectedRowKeys: [],loading: true });
        const limit = num?num:this.state.queryInfo.pageSize;

        get({url: '/sys/usergroup/ugRole/list',
            headers:{params:{page: page, limit: limit,ugId: this.props.match.params.ugId, rolename: this.state.roleName}}}).then(res => {
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
            title: '角色Id',
            dataIndex: 'roleId',
            width: 20
        }, {
            title: '角色名',
            dataIndex: 'roleName',
            width: 80
        }, {
            title: '所属部门',
            dataIndex: 'deptName',
            width: 80
        }, {
            title: '操作',
            dataIndex: '',
            width: 100,
            render: (text, record) => (
                <span>
                    {isAuth('sys:usergroup:delete') &&(
                        <Button size={"small"} type="danger" onClick={()=>this.deleteUsergroupRole(record.roleId)}>删除</Button>
                    )}
                </span>
            )
        }]
    }

    roleManage = ()=> {

    }

    userManage = ()=> {

    }

    editUsergroup = (record)=>{
        get({url:`/sys/usergroup/info/${record.ugId}`}).then(res => {
            if(res.code === 0){
                this.setState({
                    showModal: true,
                    editUgId: record.ugId,
                    usergroupData: res.sysUsergroup
                });
            }
        })
    }

    deleteUsergroupRole = (id)=>{
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:'/sys/usergroup/ugRole/delete',
                    data:{ugId:this.props.match.params.ugId,roleIds:ids},
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

    addUsergroup = ()=>{
        this.setState({
            showModal: true,
        });
    }

    cancelAdd = ()=>{
        this.setState({
            showModal: false,
        });
    }

    saveUsergroupRoleSuccess = ()=>{
        this.setState({
            showModal: false,
        });
        this.start();
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    roleNameInput = (e)=>{
        this.setState({
            roleName:e.target.value
        });
    }

    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="系统管理" second={<Link to={'/app/sys/usergroup'}>用户组管理</Link>} third="用户组角色管理"/>
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
                                    {isAuth('sys:usergroup:save') &&(
                                        <Button type="primary" onClick={this.addUsergroup}>添加</Button>
                                    )}
                                    {isAuth('sys:usergroup:delete') &&(
                                        <Button type="danger"
                                                disabled={this.state.selectedRowKeys.length === 0}
                                                onClick={()=>this.deleteUsergroupRole()}
                                        >
                                            批量删除
                                        </Button>
                                    )}
                                    <Button type={"primary"}><Link to={'/app/sys/usergroup'}>返回</Link></Button>
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
                                       onRow={(record)=>{
                                           return {onClick: ()=>{
                                                   let selectedRowKeys = JSON.parse(JSON.stringify(this.state.selectedRowKeys));
                                                   if(selectedRowKeys.includes(record.key)) {
                                                       selectedRowKeys = selectedRowKeys.filter(e => e!==record.key)
                                                   }else {
                                                       selectedRowKeys.push(record.key);
                                                   }
                                                   this.setState({ selectedRowKeys});
                                               }}
                                       }}
                                />
                            </Card>
                        </div>
                    </Col>
                </Row>
                <UsergourpRoleAdd
                    visible={this.state.showModal}
                    cancelAdd={this.cancelAdd}
                    ugId={this.props.match.params.ugId}
                    saveUsergroupRoleSuccess={this.saveUsergroupRoleSuccess}
                />

            </div>
        )
    }
}

export default UsergroupRole;
