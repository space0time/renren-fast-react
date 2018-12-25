import React, {Component} from 'react';
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Input, Modal, notification, Row, Table, Tag} from "antd";
import {Redirect} from "react-router-dom";
import JobAddOrUpdate from "./JobAddOrUpdate";
import ScheduleLogList from "./scheduleLogList"
import {get, post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

class schedule extends Component {
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
        beanName: '',//查询条件
        needLogin: false,
        showModal: false,
        editJobId: null,
        jobData: {},
        showLogList:false,
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

        get({url:SERVER_URL + '/sys/schedule/list',
            headers:{params:{page: page, limit: limit, beanName: this.state.beanName}}}).then(res => {
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
                        val.key = val.jobId;
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
    };

    /**
     * 定义表格列
     * @returns {*[]}
     */
    getColumn = () => {
        return [{
            title: 'Id',
            dataIndex: 'jobId',
            width: 20
        }, {
            title: 'Bean名称',
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
            title: 'cron表达式',
            dataIndex: 'cronExpression',
            width: 80
        }, {
            title: '备注',
            dataIndex: 'remark',
            width: 80
        }, {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (text) => {
                const tag = text === 0 ? '正常' : '暂停';
                const color = text === 0 ? 'blue' : 'red';
                return <Tag color={color} key={tag}>{tag}</Tag>
            }
        }, {
            title: '操作',
            dataIndex: '',
            width: 100,
            render: (text, record) => (
                <span>
                    <Button size={"small"} type="primary" onClick={()=>this.editJob(record)}>修改</Button>
                    <Button size={"small"} type="danger" onClick={()=>this.deleteJob(record.jobId)}>删除</Button>
                    <Button size={"small"} type="danger" onClick={()=>this.pauseJob(record.jobId)}>暂停</Button>
                    <Button size={"small"} type="danger" onClick={()=>this.resumeJob(record.jobId)}>恢复</Button>
                    <Button size={"small"} type="danger" onClick={()=>this.runJob(record.jobId)}>立即执行</Button>
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
    beanNameInput = (e) =>{
        this.setState({
            beanName:e.target.value
        });
    }

    /**
     * 添加定时任务
     */
    addJob = ()=>{
        this.setState({
            showModal: true,
            editJobId: null,
            jobData:{}
        });
    }

    /**
     * 子组件点击取消
     */
    cancelAdd = ()=>{
        this.setState({
            showModal: false,
            editJobId: null,
            jobData:{}
        });
    }

    /**
     * 保存定时任务成功
     */
    saveJobSuccess = ()=>{
        this.setState({
            showModal: false,
            editJobId: null,
            jobData:{}
        });
        this.start();
    }

    /**
     * 编辑定时任务
     */
    editJob = (record) => {
        get({url:SERVER_URL+`/sys/schedule/info/${record.jobId}`}).then(res => {
            console.log(res);
            if(res.code === 0){
                this.setState({
                    showModal: true,
                    editJobId: record.jobId,
                    jobData: res.schedule
                });
            }
        })
    }

    pauseJob = (id) => {
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '暂停' : '批量暂停'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+'/sys/schedule/pause',
                    data:ids,
                    headers:{headers: {"Content-Type": "application/json"}}
                }).then( res => {
                    const {code, msg} = res;
                    if(code !== 0){
                        Modal.error({title:msg});
                    }else{
                        Modal.success({title:'操作成功'});
                        this.start();
                    }
                });
            }
        });
    }

    resumeJob = (id) => {
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '恢复' : '批量恢复'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+'/sys/schedule/resume',
                    data:ids,
                    headers:{headers: {"Content-Type": "application/json"}}
                }).then( res => {
                    const {code, msg} = res;
                    if(code !== 0){
                        Modal.error({title:msg});
                    }else{
                        Modal.success({title:'操作成功'});
                        this.start();
                    }
                });
            }
        });
    }

    runJob = (id) => {
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '立即执行' : '批量立即执行'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+'/sys/schedule/run',
                    data:ids,
                    headers:{headers: {"Content-Type": "application/json"}}
                }).then( res => {
                    const {code, msg} = res;
                    if(code !== 0){
                        Modal.error({title:msg});
                    }else{
                        Modal.success({title:'操作成功'});
                        this.start();
                    }
                });
            }
        });
    }
    /**
     * 删除定时任务
     */
    deleteJob= (id) => {
        const ids = id ? [id] : this.state.selectedRowKeys;
        Modal.confirm({
            title:`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+'/sys/schedule/delete',
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

    logList = ()=>{
        this.setState({
            showLogList:true,
        });
    }
    hideLogList = ()=>{
        this.setState({
            showLogList:false,
        })
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
                <BreadcrumbCustom first="系统管理" second="定时任务" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Input placeholder="Bean名称"
                                           style={{ width: 200 , marginRight: '15px'}}
                                           value={this.state.beanName}
                                           onChange={this.beanNameInput}
                                           onPressEnter={() => this.start()}
                                    />
                                    <Button type="default" onClick={()=>this.start()} >查询</Button>
                                    <Button type="primary" onClick={this.addJob}>新增</Button>
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={()=>this.deleteJob()}
                                    >
                                        批量删除
                                    </Button>
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={()=>this.pauseJob()}
                                    >
                                        批量暂停
                                    </Button>
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={()=>this.resumeJob()}
                                    >
                                        批量恢复
                                    </Button>
                                    <Button type="danger"
                                            disabled={this.state.selectedRowKeys.length === 0}
                                            onClick={()=>this.runJob()}
                                    >
                                        批量立即执行
                                    </Button>
                                    <Button type="warning" onClick={this.logList}>日志列表</Button>
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
                <JobAddOrUpdate
                    visible={this.state.showModal}
                    jobId = {this.state.editJobId}
                    jobData = {this.state.jobData}
                    cancelAdd={this.cancelAdd}
                    saveJobSuccess={this.saveJobSuccess}
                />
                <ScheduleLogList
                    visible={this.state.showLogList}
                    hideLogList={this.hideLogList}
                />
            </div>
        )
    }
}


export default schedule;
