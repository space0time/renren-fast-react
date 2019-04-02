import React, {Component} from 'react';
import {Form, Input, Modal, TreeSelect} from "antd";
import { get,post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import {isAuth, treeDataTranslate } from '@/utils'

const FormItem = Form.Item;

class UsergroupAddOrUpdate extends Component {

    state = {
        treeData:[],
    }

    componentDidMount(){
        isAuth('sys:dept:list') &&(
            get({url:'/sys/dept/list'}).then(res => {
                const data = treeDataTranslate(res, 'deptId');
                this.setState({
                    treeData: data,
                })
            })
        )
    }

    handleOk = ()=>{
        const {ugId, saveUsergroupSuccess} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.ugId=ugId;
                console.log('Received values of form: ', values);
                post({url:`/sys/usergroup/${!ugId ? 'save' : 'update'}`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !ugId ?'保存成功':'修改成功',
                            onOk: ()=>{ saveUsergroupSuccess() }
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

    render() {

        const { getFieldDecorator } = this.props.form;
        const {userId, visible, cancelAdd} = this.props;

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

        return (
            <Modal title={ userId?"修改":"新增"}
                   visible={visible}
                   onOk={this.handleOk}
                   onCancel={cancelAdd}
                   maskClosable={false}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="用户组名称"
                        hasFeedback
                    >
                        {getFieldDecorator('ugName', {
                            rules: [{
                                required: true, message: '请输入用户组名称!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="所属部门"
                    >
                        {getFieldDecorator('deptId', {
                            rules: [{
                                required: true, message: '请选择所属部门!',
                            }],
                        })(
                            <TreeSelect
                                dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                                treeData={this.state.treeData}
                                placeholder="请选择所属部门"
                            />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="备注"
                    >
                        {getFieldDecorator('remark')(
                            <Input />

                        )}
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
    const { usergroupData } = props;
    const data = Object.keys(usergroupData).reduce((obj, key) => {
        obj[key] = Form.createFormField({value:usergroupData[key]});
        return obj
    },{});
    return data;
}

export default Form.create({mapPropsToFields})(UsergroupAddOrUpdate);
