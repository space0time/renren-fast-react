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
        selectedKeys:[],
    }

    componentDidMount(){
        get({url:SERVER_URL+'/sys/menu/list'}).then(res => {
            const data = treeDataTranslate(res, 'menuId');
            console.log(data);
            this.setState({
                treeData: data,
            })
        });

    }

    componentWillReceiveProps(nextProps){
        this.setState({
            selectedKeys:nextProps.roleData.menuIdList
        })
    }

    handleOk = ()=>{
        const { roleId, saveSuccess } = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.roleId=roleId;
                values.menuIdList = this.state.selectedKeys;
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

    onCheck = selectedKeys => {
        this.setState({
            selectedKeys
        });
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
                            <Tree
                                checkable
                                defaultExpandAll={defaultExpandAll}
                                checkedKeys={this.state.selectedKeys}
                                onCheck={this.onCheck}
                            >
                                {this.renderTreeNodes(this.state.treeData)}
                            </Tree>
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
