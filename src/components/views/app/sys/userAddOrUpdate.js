import React, {Component} from 'react'
import {Checkbox, Form, Input, Modal, Radio, TreeSelect} from "antd";
import { get,post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import {isAuth, treeDataTranslate } from '@/utils'


const FormItem = Form.Item;

class UserAddOrUpdate extends Component {
    state = {
        treeData:[],
        confirmDirty: false
    }

    componentDidMount(){
        isAuth('sys:dept:list') &&(
            get({url:SERVER_URL+'/sys/dept/list'}).then(res => {
                const data = treeDataTranslate(res, 'deptId');
                this.setState({
                    treeData: data,
                })
            })
        )

    }

    handleOk = ()=>{
        const {userId, saveUserSuccess} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.userId=userId;
                values.salt=this.props.userData.salt;
                console.log('Received values of form: ', values);
                post({url:SERVER_URL+`/sys/user/${!userId ? 'save' : 'update'}`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !userId ?'保存成功':'修改成功',
                            onOk: ()=>{ saveUserSuccess() }
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
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };
    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次输入密码不一致!');
        } else {
            callback();
        }
    };
    checkConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };
    render() {

        const { getFieldDecorator } = this.props.form;
        const {userId, visible, cancelAdd, roleList} = this.props;

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
                        label="用户名"
                        hasFeedback
                    >
                        {getFieldDecorator('username', {
                            rules: [{
                                required: true, message: '请输入用户名!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="姓名"
                        hasFeedback
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true, message: '请输入姓名!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="密码"
                        hasFeedback
                    >
                        {getFieldDecorator('password', {
                            rules: [{
                                required: userId?false:true, message: '请输入密码!',
                            }, {
                                validator: this.checkConfirm,
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="确认密码"
                        hasFeedback
                    >
                        {getFieldDecorator('comfirmPassword', {
                            rules: [{
                                required: userId?false:true, message: '请确认你的密码!',
                            }, {
                                validator: this.checkPassword,
                            }],
                        })(
                            <Input type="password" onBlur={this.handleConfirmBlur} />
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
                        label="邮箱"
                        hasFeedback
                    >
                        {getFieldDecorator('email', {
                            rules: [{
                                type: 'email', message: '请输入合理的邮箱地址!',
                            }, {
                                required: true, message: '请输入邮箱地址!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="手机号码"
                    >
                        {getFieldDecorator('mobile', {
                            rules: [{ required: true, message: '请输入你的手机号码!' }],
                        })(
                            <Input />

                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="角色"
                    >
                        {getFieldDecorator('roleIdList', {
                            rules: [{ required: false, message: '请选择角色!' }],
                        })(
                            <Checkbox.Group>
                                {
                                    roleList.map(role =>(<Checkbox key={role.roleId} value={role.roleId} >{role.roleName}</Checkbox>))
                                }
                            </Checkbox.Group>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="状态"
                    >
                        {getFieldDecorator('status')(
                            <Radio.Group >
                                <Radio value={0}>禁用</Radio>
                                <Radio value={1} >正常</Radio>
                            </Radio.Group>
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
    const { userData } = props;
    const data = Object.keys(userData).reduce((obj, key) => {
        obj[key] = Form.createFormField({value:userData[key]});
        return obj
    },{});
    return data;
}

export default Form.create({mapPropsToFields})(UserAddOrUpdate);
