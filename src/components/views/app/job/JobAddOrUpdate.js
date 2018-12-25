import React, {Component} from 'react'
import {Form, Input, Modal} from "antd";
import {post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

const FormItem = Form.Item;

class JobAddOrUpdate extends Component{
    state = {
        confirmDirty: false
    }

    handleOk = ()=>{
        const {jobId, saveJobSuccess, jobData} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.jobId=jobId;
                post({url:SERVER_URL+`/sys/schedule/${!jobId ? 'save' : 'update'}`,
                    data:{...jobData, ...values}
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !jobId ?'保存成功':'修改成功',
                            onOk: ()=>{ saveJobSuccess() }
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
        const {jobId, visible, cancelAdd} = this.props;

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
            <Modal title={ jobId?"修改":"新增"}
                   visible={visible}
                   onOk={this.handleOk}
                   onCancel={cancelAdd}
                   maskClosable={false}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="bean名称"
                        hasFeedback
                    >
                        {getFieldDecorator('beanName', {
                            rules: [{
                                required: true, message: '请输入bean名称!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="方法名称"
                        hasFeedback
                    >
                        {getFieldDecorator('methodName', {
                            rules: [{
                                required: true, message: '请输入方法名称!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="参数"
                    >
                        {getFieldDecorator('params')(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="cron表达式"
                        hasFeedback
                    >
                        {getFieldDecorator('cronExpression', {
                            rules: [{
                                required: true, message: '请输入cron表达式!',
                            }],
                        })(
                            <Input />
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
    const { jobData } = props;
    const data = Object.keys(jobData).reduce((obj, key) => {
        obj[key] = Form.createFormField({value:jobData[key]});
        return obj
    },{});
    return data;
}

export default Form.create({mapPropsToFields})(JobAddOrUpdate);
