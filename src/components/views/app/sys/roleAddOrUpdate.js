import React, { Component } from 'react'
import { Form, Input, Modal, Tree } from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import { treeDataTranslate } from '@/utils'

const FormItem = Form.Item;
const { TreeNode } = Tree;


class RoleAddOrUpdate extends Component {

    state = {
        treeData:[],
        checkedKeys:{checked:[]},
    }

    componentDidMount(){
        get({url:SERVER_URL+'/sys/menu/list'}).then(res => {
            const data = treeDataTranslate(res, 'menuId');
            this.setState({
                treeData: data,
            })
        });

    }

    componentWillReceiveProps(nextProps){
        this.setState({
            checkedKeys:{checked:nextProps.roleData.menuIdList?nextProps.roleData.menuIdList:[]}
        })
    }

    handleOk = ()=>{
        const { roleId, saveSuccess } = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.roleId=roleId;
                values.menuIdList = this.state.checkedKeys.checked;
                console.log('Received values of form: ', values);
                post({url:SERVER_URL+`/sys/role/${!roleId ? 'save' : 'update'}`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !roleId ?'保存成功':'修改成功',
                            onOk: ()=>{ saveSuccess() }
                        });
                    }else{
                        Modal.error({
                            title: res.msg
                        });
                    }
                })

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

    childKeys = (node, root) => {
        let rs = []
        if(!root && !node.props.children){
            rs = [node.key];
        }else if(node.props.children){
            node.props.children.forEach(e=>{
                rs.push(e.key);
                if(e.props.children){
                    rs = rs.concat(this.childKeys(e, false));
                }
            })
        }
        return rs;
    }
    onCheck = (checkedKeys, e) => {
        const {checked, node} = e;
        if(checked && !node.isLeaf()){
            checkedKeys.checked = checkedKeys.checked.concat(this.childKeys(node, true));
        }else if(!checked && !node.isLeaf()){
            const childKeys = this.childKeys(node, true);
            checkedKeys.checked = checkedKeys.checked.filter(i => !childKeys.includes(i));
        }
        this.setState({
            checkedKeys
        });


    }

    onSelect = (selectedKeys, e)=>{
        const {node} = e;
        const checkedKeys = JSON.parse(JSON.stringify(this.state.checkedKeys));

        checkedKeys.checked = checkedKeys.checked.map(i=>i+'');
        if(checkedKeys.checked.includes(node.props.eventKey)){
            if(node.isLeaf()) {
                checkedKeys.checked = checkedKeys.checked.filter(i=> i!==node.props.eventKey)
            }else {
                const childKeys = this.childKeys(node, true);
                childKeys.push(node.props.eventKey);
                checkedKeys.checked = checkedKeys.checked.filter(i => !childKeys.includes(i));
            }
        }else {
            if(node.isLeaf()) {
                checkedKeys.checked.push(node.props.eventKey);
            }else {
                const childKeys = this.childKeys(node, true);
                childKeys.push(node.props.eventKey);
                checkedKeys.checked = checkedKeys.checked.concat(childKeys);
            }
        }
        this.setState({
            checkedKeys
        })
    }



    render() {

        const { getFieldDecorator } = this.props.form;
        const {roleId, visible, cancelAdd} = this.props;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const defaultExpandAll = true;

        return (
            <Modal title={ roleId?"修改":"新增"}
                   visible={visible}
                   onOk={this.handleOk}
                   onCancel={cancelAdd}
                   maskClosable={false}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="角色名称"
                        hasFeedback
                    >
                        {getFieldDecorator('roleName', {
                            rules: [{
                                required: true, message: '请输入角色名称!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="备注"
                        hasFeedback
                    >
                        {getFieldDecorator('remark', {
                            rules: [{
                                required: false
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="授权"
                    >
                        {this.state.treeData.length?
                            <Tree
                                checkable
                                defaultExpandAll={defaultExpandAll}
                                checkedKeys={this.state.checkedKeys}
                                checkStrictly
                                onCheck={this.onCheck}
                                onSelect={this.onSelect}
                            >
                                {this.renderTreeNodes(this.state.treeData)}
                            </Tree>: 'loading tree'}
                    </FormItem>
                </Form>
            </Modal>
        )

    }
}

    /**
     * 父组件传递的参数初始化表单
     * @param props
     * @returns {{}}
     */
    const mapPropsToFields = (props)=>{
    const { roleData } = props;
    const data = Object.keys(roleData).reduce((obj, key) => {
            obj[key] = Form.createFormField({value:roleData[key]});
            return obj
        },{});
        return data;
    }

    export default Form.create({mapPropsToFields})(RoleAddOrUpdate);
