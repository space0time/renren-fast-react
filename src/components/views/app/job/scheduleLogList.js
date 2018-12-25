import React, {Component} from 'react'
import {Button, Card, Col, Input, Modal, notification, Row, Table, Tag} from "antd";
import {get} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

class scheduleLogList extends Component{

    state = {
        loading: false,
        queryInfo: {//设置最初一页显示多少条
            pageSize: 10
        },
        dataSource: {//数据存放
            count: 0,//一共几条数据
            data: [],//数据
        },
        jobId:'',
    }

    componentDidMount(){
        this.start();
    }

    jobIdInput = (e)=>{
        this.setState({
            jobId: e.target.value,
        })
    }

    getColumn = ()=>{
        return [{
            title: '日志ID',
            dataIndex: 'logId',
            width: 20
        }, {
            title: '任务ID',
            dataIndex: 'jobId',
            width: 20
        }, {
            title: 'bean名称',
            dataIndex: 'beanName',
            width: 80
        }, {
            title: '方法名称',
            dataIndex: 'methodName',
            width: 80
        }, {
            title: '参数',
            dataIndex: 'params',
            width: 80
        }, {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (text) => {
                const tag = text === 0 ? '成功' : '失败';
                const color = text === 0 ? 'blue' : 'red';
                return <Tag color={color} key={tag}>{tag}</Tag>
            }
        }, {
            title: '耗时(单位:毫秒)',
            dataIndex: 'times',
            width: 80
        }, {
            title: '执行时间',
            dataIndex: 'createTime',
            width: 120
        }]
    }

    start = (page=1,num)=>{
        this.setState({ loading: true });
        const limit = num?num:this.state.queryInfo.pageSize;

        get({url:SERVER_URL + '/sys/scheduleLog/list',
            headers:{params:{page: page, limit: limit, jobId: this.state.jobId}}}).then(res => {
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
                        val.key = val.logId;
                        return val;
                    })],
                    count: page.totalCount
                },
                queryInfo : {
                    pageSize: limit
                },
                loading: false,
                selectedRowKeys: [],
            });
        });
    }

    render() {

        const {visible,hideLogList} = this.props;


        return (
            <Modal title={ "日志列表"}
                   visible={visible}
                   onOk={hideLogList}
                   onCancel={hideLogList}
                   maskClosable={false}
                   width={1000}
            >
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Input placeholder="任务ID"
                                           style={{ width: 200 , marginRight: '15px'}}
                                           value={this.state.jobId}
                                           onChange={this.jobIdInput}
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


            </Modal>
        )
    }
}

export default scheduleLogList;
