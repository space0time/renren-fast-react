import React, {Component} from 'react'
import {Modal, Row, Col, Layout, Tree, Table, notification, Button} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import { treeDataTranslate } from '@/utils'

const {
    Header, Content,
} = Layout;

const { TreeNode } = Tree;

class UsergourpUserAdd extends Component {

    state = {
        treeData: [],
        treeSelect: null,
        user:{
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
        userSelected:[],
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
        const data = this.state.user.selectedRowKeys.map(key=>{return {ugId:this.props.ugId,userId:key}})
        post({url:'/sys/usergroup/ugUser/save',
            data,
            headers:{headers: {"Content-Type": "application/json"}}
        }).then( res => {
            const {code, msg} = res;
            if(code !== 0){
                Modal.error({title:msg});
            }else{
                Modal.success({title:'保存成功'});
                this.props.saveUsergroupUserSuccess();
                this.setState({
                    treeSelect: null,
                    user:{
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
                    userSelected:[],
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
            title: '用户ID',
            dataIndex: 'userId',
            width: 20
        }, {
            title: '用户名',
            dataIndex: 'username',
            width: 80
        }]
    }
    getSelectedColumn = () => {
        return [{
            title: '用户ID',
            dataIndex: 'userId',
            width: 20
        }, {
            title: '用户名',
            dataIndex: 'username',
            width: 80
        }, {
            title: '操作',
            width: 80,
            render: (text, record) => (
                <span>
                    <Button size={"small"} type="danger" onClick={()=> {
                        const user = JSON.parse(JSON.stringify(this.state.user));
                        user.selectedRowKeys = user.selectedRowKeys.filter(e=>e!==record.userId);
                        const userSelected = JSON.parse(JSON.stringify(this.state.userSelected));
                        this.setState({ user, userSelected:userSelected.filter(e=>e.userId!==record.userId)});
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
        const user = JSON.parse(JSON.stringify(this.state.user));
        user.loading = true;
        this.setState({ user });

        const limit = num?num:this.state.user.queryInfo.pageSize;

        get({url: '/sys/usergroup/userList',
            headers:{params:{page: page, limit: limit, ugId:this.props.ugId, deptId:this.state.treeSelect}}}).then(res => {
            const {code, msg, page} = res;
            if(code !== 0){
                notification['error']({
                    message:msg
                });
                return ;
            }

            const user = JSON.parse(JSON.stringify(this.state.user));
            user.loading = false;
            user.dataSource = {
                data: [...page.list.map(val => {
                    val.key = val.userId;
                    return val;
                })],
                count: page.totalCount
            };
            user.queryInfo = {pageSize: limit};
            this.setState({ user });
        });
    };

    onUserSelectChange = (selectedRowKeys)=>{
        const user = JSON.parse(JSON.stringify(this.state.user));
        user.selectedRowKeys = selectedRowKeys;

        const userSelected = JSON.parse(JSON.stringify(this.state.userSelected));
        //遍历已选择key当userSelected中不存在时添加
        selectedRowKeys.forEach(key => {
            userSelected.map(user=>user.userId).includes(key)
            || userSelected.push(user.dataSource.data.filter(data=>data.userId===key)[0]);
        })

        this.setState({ user, userSelected});
    }

    render() {
        const {visible, cancelAdd} = this.props;
        const { user } = this.state;
        const rowSelection = {
            selectedRowKeys: user.selectedRowKeys,
            onChange: this.onUserSelectChange,
        };

        return (
            <Modal title="用户选择"
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
                            <Header style={{background:'#fff'}}>可选择用户</Header>
                            <Content>
                                <Table rowSelection={rowSelection}
                                       columns={this.getColumn()}
                                       dataSource={user.dataSource.data}
                                       pagination={{//分页
                                           total: user.dataSource.count,//数据总数量
                                           pageSize: user.queryInfo.pageSize,//显示几条一页
                                           defaultPageSize: user.queryInfo.pageSize,//默认显示几条一页
                                           showSizeChanger: true,//是否显示可以设置几条一页的选项
                                           onShowSizeChange:(current, pageSize)=>{//当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                                               this.start(current, pageSize); //这边已经设置了self = this
                                           },
                                           onChange:(current)=>{//点击改变页数的选项时调用函数，current:将要跳转的页数
                                               this.start(current);
                                           },
                                           showTotal:() =>{//设置显示一共几条数据
                                               return '共 ' + user.dataSource.count + ' 条';
                                           }
                                       }}
                                       loading={user.loading}
                                       onRow={(record)=>{
                                           return {onClick: ()=>{
                                                   const user = JSON.parse(JSON.stringify(this.state.user));
                                                   let userSelected = JSON.parse(JSON.stringify(this.state.userSelected));
                                                   //当已选择key中包含当前click列则selectedRowKeys、userSelected去掉当前click列数据
                                                   if(user.selectedRowKeys.includes(record.userId)) {
                                                       user.selectedRowKeys = user.selectedRowKeys.filter(e => e!==record.userId)
                                                       userSelected = userSelected.filter(e => e.userId!==record.userId);
                                                   }else {
                                                       user.selectedRowKeys.push(record.userId);
                                                       //当userSelected中不包含当前record才添加
                                                       userSelected.map(user=>user.userId).includes(record.userId)
                                                       || userSelected.push(record);
                                                   }
                                                   this.setState({ user, userSelected});
                                           }}
                                       }}
                                />
                            </Content>
                        </Layout>
                    </Col>
                    <Col span={8}>
                        <Layout style={{background:'#fff'}}>
                            <Header style={{background:'#fff'}}>已选择用户</Header>
                            <Content>
                                <Table dataSource={this.state.userSelected.filter(e => user.selectedRowKeys.includes(e.userId))}
                                       columns={this.getSelectedColumn()} />
                            </Content>
                        </Layout>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

export default UsergourpUserAdd;
