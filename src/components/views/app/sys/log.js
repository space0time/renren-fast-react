import React, {Component} from 'react'
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Input, notification, Row, Table} from "antd";
import {Redirect} from "react-router-dom";
import {get} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

class Log extends Component {

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
        key: '',//查询条件
    }

    componentDidMount(){
        this.start();
    }

    /**
     * 加载表格数据
     * @param page
     * @param num
     */
    start = (page=1,num) => {
        this.setState({ loading: true });
        const limit = num?num:this.state.queryInfo.pageSize;

        get({url: '/sys/log/list',
            headers:{params:{page: page, limit: limit, key: this.state.key}}}).then(res => {
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
                        val.key = val.id;
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
            dataIndex: 'id',
            width: 20
        }, {
            title: '用户名',
            dataIndex: 'username',
            width: 80
        }, {
            title: '用户操作',
            dataIndex: 'operation',
            width: 80
        }, {
            title: '请求方法',
            dataIndex: 'method',
            width: 80,
            render(text){
                return text?<div title={text} style={{width:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace: 'nowrap'}}>{text}</div>:''
            }
        }, {
            title: '请求参数',
            dataIndex: 'params',
            width: 80,
            render(text){
                return text?<div title={text} style={{width:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace: 'nowrap'}}>{text}</div>:''
            }

        }, {
            title: '执行时长(毫秒)',
            dataIndex: 'time',
            width: 80
        }, {
            title: 'IP地址',
            dataIndex: 'ip',
            width: 80
        }, {
            title: '创建时间',
            dataIndex: 'createDate',
            width: 120
        }]
    }

    /**
     * 查询框输入
     * @param e
     */
    keyInput = (e) =>{
        this.setState({
            key:e.target.value
        });
    }


    render(){

        return (

            <div className="gutter-example">
                <BreadcrumbCustom first="系统管理" second="系统日志" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Input placeholder="用户名"
                                           style={{ width: 200 , marginRight: '15px'}}
                                           value={this.state.key}
                                           onChange={this.keyInput}
                                           onPressEnter={() => this.start()}
                                    />
                                    <Button type="default" onClick={()=>this.start()} >查询</Button>
                                </div>
                                <Table
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
            </div>
        )
    }
}

export default Log;
