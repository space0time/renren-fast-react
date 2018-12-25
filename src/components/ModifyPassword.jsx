import React, {Component} from 'react'
import {Form, Input, Modal} from "antd";
import { post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

const FormItem = Form.Item;

class ModifyPassword extends Component {

    state = {
        confirmDirty: false,
    }

    onOk = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                post({url:SERVER_URL+`/sys/user/password`,
                    data:values
                }).then(res =>{
                    console.log(res);
                    if(res.code === 0) {
                        Modal.success({
                            title: '修改成功',
                            onOk: ()=>{ this.props.handleMpVisibleChange(false) }
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
        if (value && value !== form.getFieldValue('newPassword')) {
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


    render(){
        const {visible, handleMpVisibleChange, username} = this.props;

        const { getFieldDecorator } = this.props.form;

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
            <Modal title={'修改密码'} onOk={this.onOk} onCancel={()=>{handleMpVisibleChange(false)}} visible={visible}>
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="账号"
                        hasFeedback
                    >
                            {username}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="原密码"
                        hasFeedback
                    >
                        {getFieldDecorator('password', {
                            rules: [{
                                required: true, message: '请输入原密码!',
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="新密码"
                        hasFeedback
                    >
                        {getFieldDecorator('newPassword', {
                            rules: [{
                                required: true, message: '请输入新密码!',
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
                                required: true, message: '请确认你的新密码!',
                            }, {
                                validator: this.checkPassword,
                            }],
                        })(
                            <Input type="password" onBlur={this.handleConfirmBlur} />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(ModifyPassword);
