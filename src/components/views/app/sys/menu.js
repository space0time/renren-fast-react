import React, { Component } from 'react'
import BreadcrumbCustom from "../../../BreadcrumbCustom";
import {Button, Card, Col, Icon, Modal, Row, Table, Tag} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import { treeDataTranslate } from '@/utils'
import MenuAddOrUpdate from './menuAddOrUpdate'

class Menu extends Component {

    state = {
        treeData:[],
        visible:false,
        menuData:{type:1,},
        menuId:undefined,
    }

    componentDidMount(){
        this.getData();
    }

    getData = ()=>{
        get({url:SERVER_URL+'/sys/menu/list'}).then(res => {
            const data = treeDataTranslate(res, 'menuId');
            this.setState({
                treeData: data,
            })
        });
    }

    getColumns = () => {
        return [{
            title: 'ID',
            dataIndex: 'menuId',
            key: 'menuId',
            width: '40',
        },{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: '80',
        }, {
            title: '上级菜单',
            dataIndex: 'parentName',
            key: 'parentName',
            width: '80',
        }, {
            title: '图标',
            dataIndex: 'icon',
            width: '80',
            key: 'icon',
            render(text){
                return text && <Icon type={text} />
            }
        }, {
            title: '类型',
            dataIndex: 'type',
            width: '80',
            key: 'type',
            render(text){
                const color = text===0?'blue':(text===1?"green":(text===2?"red":""));
                const type = text===0?'目录':(text===1?"菜单":(text===2?"按钮":""))
                return <Tag color={color} >{type}</Tag>
            }
        }, {
            title: '排序号',
            dataIndex: 'orderNum',
            width: '80',
            key: 'orderNum',
        }, {
            title: '菜单URL',
            dataIndex: 'url',
            width: '80',
            key: 'url',
            render(text){
                return text?<div title={text} style={{width:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace: 'nowrap'}}>{text}</div>:''
            }
        }, {
            title: '授权标识',
            dataIndex: 'perms',
            width: '80',
            key: 'perms',
            render(text){
                return text?<div title={text} style={{width:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace: 'nowrap'}}>{text}</div>:''
            }
        }, {
            title: '操作',
            width: '80',
            render: (text, record)=>{
                return (
                    <span>
                        <Button size={"small"} type="primary" onClick={()=>this.updateMenu(record)}>修改</Button>
                        <Button size={"small"} type="danger" onClick={()=>this.deleteMenu(record)}>删除</Button>
                    </span>
                )
            }
        }]
    }

    add = () => {
        this.setState({
            visible: true,
            menuId:undefined,
            menuData:{type:1},
        })
    }

    updateMenu = (record)=>{
        this.setState({
            visible: true,
            menuId:record.menuId,
            menuData:record,
        })
    }

    deleteMenu = (record)=>{
        const {type, name, menuId} = record;
        const typeName = type===0?'目录':(type===1?"菜单":"按钮");
        Modal.confirm({
            title:`确认删除${typeName + name}?`,
            content:'',
            onOk:()=>{
                post({url:SERVER_URL+`/sys/menu/delete/${menuId}`,
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
                menuData:{type:1},
                menuId:undefined,
            });
        })
    }
    saveMenuSuccess = ()=>{
        this.setState({
            visible: false,
            menuData:{type:1},
        },()=>{
            this.getData();
        })

    }

    render() {
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="系统管理" second="菜单管理" />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="" bordered={false}>
                                <div style={{ marginBottom: 16 }}>
                                    <Button type="primary" onClick={this.add}>新增</Button>
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
                <MenuAddOrUpdate
                    visible={this.state.visible}
                    menuData={this.state.menuData}
                    menuId={this.state.menuId}
                    cancelAdd={this.cancelAdd}
                    saveMenuSuccess={this.saveMenuSuccess}
                />
            </div>
        )
    }
}

export default Menu;
