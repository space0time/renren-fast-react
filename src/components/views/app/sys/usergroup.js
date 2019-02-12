import React, {Component} from 'react';
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Input, Modal, notification, Row, Table, Tag} from "antd";
import {Link, Redirect, Route, Switch} from "react-router-dom";
import {get, post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import {isAuth} from '@/utils'
import UsergroupAddOrUpdate from "./usergroupAddOrUpdate";
import UsergroupRole from "./usergroupRole"
import UsergroupUser from "./usergroupUser"
import NotFound from "../../../pages/NotFound";

class usergroup extends Component {

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
        ugName: '',//查询条件
        needLogin: false,
        showModal: false,
        editUgId: null,
        usergroupData: {},
    };

    componentDidMount() {
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

        get({url:SERVER_URL + '/sys/usergroup/list',
            headers:{params:{page: page, limit: limit, ugName: this.state.ugName}}}).then(res => {
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
                        val.key = val.ugId;
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
            title: '用户组Id',
            dataIndex: 'ugId',
            width: 20
        }, {
            title: '用户组名称',
            dataIndex: 'ugName',
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
                    <Button size={"small"} type="danger" onClick={()=>this.roleManage(record)}><Link to={'/app/sys/usergroup/usergroupRole/'+record.ugId}>角色管理</Link></Button>
                    <Button size={"small"} type="danger" onClick={()=>this.userManage(record)}><Link to={'/app/sys/usergroup/usergroupUser/'+record.ugId}>用户管理</Link></Button>
                    <br/>
                    {isAuth('sys:usergroup:update') &&(
                        <Button size={"small"} type="primary" onClick={()=>this.editUsergroup(record)}>修改</Button>
                    )}
                    {isAuth('sys:usergroup:delete') &&(
                        <Button size={"small"} type="danger" onClick={()=>this.deleteUsergroup(record.ugId)}>删除</Button>
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
        get({url:SERVER_URL+`/sys/usergroup/info/${record.ugId}`}).then(res => {
            if(res.code === 0){
                this.setState({
                    showModal: true,
                    editUgId: record.ugId,
                    usergroupData: res.sysUsergroup
                });
            }
        })
    }

    deleteUsergroup = (id)=>{
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+'/sys/usergroup/delete',
                    data:ids,
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
            editUgId: null,
            usergroupData:{}
        });
    }

    cancelAdd = ()=>{
        this.setState({
            showModal: false,
            editUgId: null,
            usergroupData:{}
        });
    }

    saveUsergroupSuccess = ()=>{
        this.setState({
            showModal: false,
            editUgId: null,
            usergroupData:{}
        });
        this.start();
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    ugNameInput = (e)=>{
        this.setState({
            ugName:e.target.value
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

            <Switch>
                <Route
                    key={'/app/sys/usergroup/usergroupRole'}
                    exact
                    path={'/app/sys/usergroup/usergroupRole/:ugId'}
                    component={UsergroupRole}
                ></Route>
                <Route
                    key={'/app/sys/usergroup/usergroupUser'}
                    exact
                    path={'/app/sys/usergroup/usergroupUser/:ugId'}
                    component={UsergroupUser}
                ></Route>
                <Route
                    key={'/app/sys/usergroup'}
                    exact
                    path={'/app/sys/usergroup'}
                    render={(props) => {
                        return (
                            <div className="gutter-example">
                                <BreadcrumbCustom first="系统管理" second={<Link to={'/app/sys/usergroup'}>用户组管理</Link>} />
                                <Row gutter={16}>
                                    <Col className="gutter-row" md={24}>
                                        <div className="gutter-box">
                                            <Card title="" bordered={false}>
                                                <div style={{ marginBottom: 16 }}>
                                                    <Input placeholder="用户名"
                                                           style={{ width: 200 , marginRight: '15px'}}
                                                           value={this.state.ugName}
                                                           onChange={this.ugNameInput}
                                                           onPressEnter={() => this.start()}
                                                    />
                                                    <Button type="default" onClick={()=>this.start()} >查询</Button>
                                                    {isAuth('sys:usergroup:save') &&(
                                                        <Button type="primary" onClick={this.addUsergroup}>新增</Button>
                                                    )}
                                                    {isAuth('sys:usergroup:delete') &&(
                                                        <Button type="danger"
                                                                disabled={this.state.selectedRowKeys.length === 0}
                                                                onClick={()=>this.deleteUsergroup()}
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
                                                       onRow={(record)=>{
                                                           return {onClick: ()=>{
                                                                   let selectedRowKeys = JSON.parse(JSON.stringify(this.state.selectedRowKeys));
                                                                   if(selectedRowKeys.includes(record.key)) {
                                                                       selectedRowKeys = selectedRowKeys.filter(e => e!==record.key)
                                                                   }else {
                                                                       selectedRowKeys.push(record.key);
                                                                   }
                                                                   this.setState({selectedRowKeys});
                                                               }}
                                                       }}
                                                />
                                            </Card>
                                        </div>
                                    </Col>
                                </Row>
                                <UsergroupAddOrUpdate
                                    visible={this.state.showModal}
                                    ugId = {this.state.editUgId}
                                    usergroupData = {this.state.usergroupData}
                                    cancelAdd={this.cancelAdd}
                                    saveUsergroupSuccess={this.saveUsergroupSuccess}
                                />
                            </div>
                        )
                    }}
                >
                </Route>
                <Route render={() => <NotFound />} />
            </Switch>

        )
    }
}

export default usergroup;
