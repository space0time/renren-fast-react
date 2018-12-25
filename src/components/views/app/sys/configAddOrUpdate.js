import React, {Component} from 'react'
import {Form, Input, Modal} from "antd";
import {post} from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

const FormItem = Form.Item;

class ConfigAddOrUpdate extends Component {
    state = {
        confirmDirty: false
    }

    handleOk = ()=>{
        const {id, saveConfigSuccess} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.id=id;
                post({url:SERVER_URL+`/sys/config/${!id ? 'save' : 'update'}`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !id ?'保存成功':'修改成功',
                            onOk: ()=>{ saveConfigSuccess() }
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
        const {id, visible, cancelAdd} = this.props;

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
            <Modal title={ id?"修改":"新增"}
                   visible={visible}
                   onOk={this.handleOk}
                   onCancel={cancelAdd}
                   maskClosable={false}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="参数名"
                        hasFeedback
                    >
                        {getFieldDecorator('paramKey', {
                            rules: [{
                                required: true, message: '请输入参数名!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="参数值"
                        hasFeedback
                    >
                        {getFieldDecorator('paramValue', {
                            rules: [{
                                required: true, message: '请输入参数值!',
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
    const { configData } = props;
    const data = Object.keys(configData).reduce((obj, key) => {
        obj[key] = Form.createFormField({value:configData[key]});
        return obj
    },{});
    return data;
}

export default Form.create({mapPropsToFields})(ConfigAddOrUpdate);
