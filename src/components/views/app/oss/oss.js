import React, {Component} from 'react'
import {Button, Card, Col, Modal, notification, Row, Table} from "antd";
import {Redirect} from "react-router-dom";
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {get, post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import OssConfig from "./ossConfig"
import OssUpload from './ossUpload'

class oss extends Component {

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
        showConfig: false,
        showUpload: false,
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
        this.setState({ loading: true });
        const limit = num?num:this.state.queryInfo.pageSize;

        get({url: '/sys/oss/list',
            headers:{params:{page: page, limit: limit, username: this.state.username}}}).then(res => {
            const {code, msg, page} = res;
            if(code !== 0){
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
            title: 'URL地址',
            dataIndex: 'url',
            width: 200
        }, {
            title: '创建时间',
            dataIndex: 'createDate',
            width: 80
        }, {
            title: '操作',
            dataIndex: '',
            width: 40,
            render: (text, record) => (
                <span>
                    <Button size={"small"} type="danger" onClick={()=>this.deleteFile(record.id)}>删除</Button>
                </span>
            )
        }]
    }

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };


    /**
     * 删除
     */
    deleteFile= (id) => {
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:'/sys/oss/delete',
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

    showConfig = ()=>{
        this.setState({
            showConfig: true,
        });
    }
    hideConfig = ()=>{
        this.setState({
            showConfig: false,
        });
    }
    showUpload = ()=>{
        this.setState({
            showUpload: true,
        });
    }
    hideUpload = ()=>{
        this.setState({
            showUpload: false,
        },()=>{
            this.start();
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
                <BreadcrumbCustom first="系统管理" second="文件上传" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Button type="default" onClick={this.showConfig}>云存储配置</Button>
                                    <Button type="primary" onClick={this.showUpload}>上传文件</Button>
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={()=>this.deleteFile()}
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
                <OssConfig
                    visible={this.state.showConfig}
                    hideConfig={this.hideConfig}
                />
                <OssUpload
                    visible={this.state.showUpload}
                    hideUpload={this.hideUpload}
                />

            </div>
        )
    }
}

export default oss;
