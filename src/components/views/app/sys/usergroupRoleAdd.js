import React, {Component} from 'react'
import {Modal, Row, Col, Layout, Tree, Table, notification, Button} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import { treeDataTranslate } from '@/utils'

const {
    Header, Content,
} = Layout;

const { TreeNode } = Tree;

class UsergourpRoleAdd extends Component {

    state = {
        treeData: [],
        treeSelect: null,
        role:{
            selectedRowKeys: [],
            loading: false,
            queryInfo: {//设置最初一页显示多少条
                pageSize: 10
            },
            dataSource: {//数据存放
                count: 0,//一共几条数据
                data: [],//数据
            },
        },
        roleSelected:[],
    }

    componentDidMount(){
        get({url:'/sys/dept/list'}).then(res => {
            const data = treeDataTranslate(res, 'deptId');
            this.setState({
                treeData: data,
            })
        });

    }

    onSelect = (selectedKeys)=>{
        this.setState({
            treeSelect:selectedKeys[0],
        },()=>{
            this.start();
        })
    }

    handleOk = ()=>{
        const data = this.state.role.selectedRowKeys.map(key=>{return {ugId:this.props.ugId,roleId:key}})
        post({url:'/sys/usergroup/ugRole/save',
            data,
            headers:{headers: {"Content-Type": "application/json"}}
        }).then( res => {
            const {code, msg} = res;
            if(code !== 0){
                Modal.error({title:msg});
            }else{
                Modal.success({title:'保存成功'});
                this.props.saveUsergroupRoleSuccess();
                this.setState({
                    treeSelect: null,
                    role:{
                        selectedRowKeys: [],
                        loading: false,
                        queryInfo: {//设置最初一页显示多少条
                            pageSize: 10
                        },
                        dataSource: {//数据存放
                            count: 0,//一共几条数据
                            data: [],//数据
                        },
                    },
                    roleSelected:[],
                });
            }
        });
    }

    renderTreeNodes = data => data.map((item) => {
        if (item.children) {
            return (
                <TreeNode title={item.title} key={item.key} dataRef={item}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode {...item} dataRef={item} />;
    })
    /**
     * 定义表格列
     * @returns {*[]}
     */
    getColumn = () => {
        return [{
            title: '角色ID',
            dataIndex: 'roleId',
            width: 20
        }, {
            title: '角色名称',
            dataIndex: 'roleName',
            width: 80
        }]
    }
    getSelectedColumn = () => {
        return [{
            title: '角色ID',
            dataIndex: 'roleId',
            width: 20
        }, {
            title: '角色名称',
            dataIndex: 'roleName',
            width: 80
        }, {
            title: '操作',
            width: 80,
            render: (text, record) => (
                <span>
                    <Button size={"small"} type="danger" onClick={()=> {
                        const role = JSON.parse(JSON.stringify(this.state.role));
                        role.selectedRowKeys = role.selectedRowKeys.filter(e=>e!==record.roleId);
                        const roleSelected = JSON.parse(JSON.stringify(this.state.roleSelected));
                        this.setState({ role, roleSelected:roleSelected.filter(e=>e.roleId!==record.roleId)});
                    }}>删除</Button>
                </span>
            )
        }]
    }
    /**
     * 加载表格数据
     * @param page
     * @param num
     */
    start = (page=1,num) => {
        const role = JSON.parse(JSON.stringify(this.state.role));
        role.loading = true;
        this.setState({ role });

        const limit = num?num:this.state.role.queryInfo.pageSize;

        get({url: '/sys/usergroup/roleList',
            headers:{params:{page: page, limit: limit, ugId:this.props.ugId, deptId:this.state.treeSelect}}}).then(res => {
            const {code, msg, page} = res;
            if(code !== 0){
                notification['error']({
                    message:msg
                });
                return ;
            }

            const role = JSON.parse(JSON.stringify(this.state.role));
            role.loading = false;
            role.dataSource = {
                data: [...page.list.map(val => {
                    val.key = val.roleId;
                    return val;
                })],
                count: page.totalCount
            };
            role.queryInfo = {pageSize: limit};
            this.setState({ role });
        });
    };

    onRoleSelectChange = (selectedRowKeys)=>{
        const role = JSON.parse(JSON.stringify(this.state.role));
        role.selectedRowKeys = selectedRowKeys;

        const roleSelected = JSON.parse(JSON.stringify(this.state.roleSelected));
        //遍历已选择key当roleSelected中不存在时添加
        selectedRowKeys.forEach(key => {
            roleSelected.map(role=>role.roleId).includes(key)
            || roleSelected.push(role.dataSource.data.filter(data=>data.roleId===key)[0]);
        })

        this.setState({ role, roleSelected});
    }

    render() {
        const {visible, cancelAdd} = this.props;
        const { role } = this.state;
        const rowSelection = {
            selectedRowKeys: role.selectedRowKeys,
            onChange: this.onRoleSelectChange,
        };

        return (
            <Modal title="角色选择"
                   visible={visible}
                   onOk={this.handleOk}
                   onCancel={cancelAdd}
                   maskClosable={false}
                   width={1024}
            >
                <Row type="flex" justify="space-around" style={{height:'400px'}} >
                    <Col span={7}>
                        <Layout style={{background:'#fff'}} >
                            <Header style={{background:'#fff'}}>部门树</Header>
                            <Content>
                                {this.state.treeData.length?
                                    <Tree
                                        checkable={false}
                                        defaultExpandAll={true}
                                        showLine={true}
                                        onSelect={this.onSelect}
                                    >
                                        {this.renderTreeNodes(this.state.treeData)}
                                    </Tree>: 'loading tree'}
                            </Content>
                        </Layout>
                    </Col>
                    <Col span={8}>
                        <Layout style={{background:'#fff'}}>
                            <Header style={{background:'#fff'}}>可选择角色</Header>
                            <Content>
                                <Table rowSelection={rowSelection}
                                       columns={this.getColumn()}
                                       dataSource={role.dataSource.data}
                                       pagination={{//分页
                                           total: role.dataSource.count,//数据总数量
                                           pageSize: role.queryInfo.pageSize,//显示几条一页
                                           defaultPageSize: role.queryInfo.pageSize,//默认显示几条一页
                                           showSizeChanger: true,//是否显示可以设置几条一页的选项
                                           onShowSizeChange:(current, pageSize)=>{//当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                                               this.start(current, pageSize); //这边已经设置了self = this
                                           },
                                           onChange:(current)=>{//点击改变页数的选项时调用函数，current:将要跳转的页数
                                               this.start(current);
                                           },
                                           showTotal:() =>{//设置显示一共几条数据
                                               return '共 ' + role.dataSource.count + ' 条';
                                           }
                                       }}
                                       loading={role.loading}
                                       onRow={(record)=>{
                                           return {onClick: ()=>{
                                                   const role = JSON.parse(JSON.stringify(this.state.role));
                                                   let roleSelected = JSON.parse(JSON.stringify(this.state.roleSelected));
                                                   //当已选择key中包含当前click列则selectedRowKeys、roleSelected去掉当前click列数据
                                                   if(role.selectedRowKeys.includes(record.roleId)) {
                                                       role.selectedRowKeys = role.selectedRowKeys.filter(e => e!==record.roleId)
                                                       roleSelected = roleSelected.filter(e => e.roleId!==record.roleId);
                                                   }else {
                                                       role.selectedRowKeys.push(record.roleId);
                                                       //当roleSelected中不包含当前record才添加
                                                       roleSelected.map(role=>role.roleId).includes(record.roleId)
                                                       || roleSelected.push(record);
                                                   }
                                                   this.setState({ role, roleSelected});
                                           }}
                                       }}
                                />
                            </Content>
                        </Layout>
                    </Col>
                    <Col span={8}>
                        <Layout style={{background:'#fff'}}>
                            <Header style={{background:'#fff'}}>已选择角色</Header>
                            <Content>
                                <Table dataSource={this.state.roleSelected.filter(e => role.selectedRowKeys.includes(e.roleId))}
                                       columns={this.getSelectedColumn()} />
                            </Content>
                        </Layout>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

export default UsergourpRoleAdd;
