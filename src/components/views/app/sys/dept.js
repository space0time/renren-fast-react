import React, { Component } from 'react'
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Modal, Row, Table} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import {isAuth, treeDataTranslate} from '@/utils'
import DeptAddOrUpdate from "./deptAddOrUpdate";

class Dept extends Component {

    state = {
        treeData:[],
        visible:false,
        deptData:{},
        deptId:undefined,
    }

    componentDidMount(){
        this.getData();
    }

    getData = ()=>{
        get({url:SERVER_URL+'/sys/dept/list'}).then(res => {
            const data = treeDataTranslate(res, 'deptId');
            this.setState({
                treeData: data,
            })
        });
    }

    getColumns = () => {
        return [{
            title: 'ID',
            dataIndex: 'deptId',
            key: 'deptId',
            width: '40',
        },{
            title: '部门名称',
            dataIndex: 'name',
            key: 'name',
            width: '80',
        }, {
            title: '上级部门',
            dataIndex: 'parentName',
            key: 'parentName',
            width: '80',
        }, {
            title: '排序号',
            dataIndex: 'orderNum',
            width: '80',
            key: 'orderNum',
        }, {
            title: '操作',
            width: '80',
            render: (text, record)=>{
                return (
                    <span>
                        {isAuth('sys:dept:update') &&(
                            <Button size={"small"} type="primary" onClick={()=>this.updateDept(record)}>修改</Button>
                        )}
                        {isAuth('sys:dept:delete') &&(
                            <Button size={"small"} type="danger" onClick={()=>this.deleteDept(record)}>删除</Button>
                        )}
                    </span>
                )
            }
        }]
    }

    add = ()=>{
        this.setState({
            visible: true,
            deptId:undefined,
            deptData:{},
        })
    }

    updateDept = (record)=>{
        console.log(record);
        this.setState({
            visible: true,
            deptId:record.deptId,
            deptData:record,
        })
    }

    deleteDept = (record)=>{
        const {name, deptId} = record;
        Modal.confirm({
            title:`确认删除${name}?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+`/sys/dept/delete/${deptId}`,
                    headers:{headers: {"Content-Type": "application/json"}}
                }).then( res => {
                    const {code, msg} = res;
                    if(code !== 0){
                        Modal.error({title:msg});
                    }else{
                        Modal.success({title:'删除成功'});
                        this.getData();
                    }
                });
            }
        });
    }

    cancelAdd = () => {
        this.setState({
            visible: false,
        },()=>{
            this.setState({
                deptData:{},
                deptId:undefined,
            });
        })
    }
    saveDeptSuccess = ()=>{
        this.setState({
            visible: false,
            deptData:{},
        },()=>{
            this.getData();
        })

    }

    render(){

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="系统管理" second="部门管理" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    {isAuth('sys:dept:save') &&(
                                        <Button type="primary" onClick={this.add}>新增</Button>
                                    )}
                                </div>
                                <Table columns={this.getColumns()}
                                       dataSource={this.state.treeData}
                                       pagination={false}
                                       indentSize={20}
                                />

                            </Card>
                        </div>
                    </Col>
                </Row>
                <DeptAddOrUpdate
                    visible={this.state.visible}
                    deptData={this.state.deptData}
                    deptId={this.state.deptId}
                    cancelAdd={this.cancelAdd}
                    saveDeptSuccess={this.saveDeptSuccess}
                />
            </div>
        )
    }
}

export default Dept;
