import React, { Component } from 'react'
import {Form, Input, Modal, Radio} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'

const FromItem = Form.Item;

class OssConfig extends Component {


    componentDidMount(){

        get({url:SERVER_URL+'/sys/oss/config'}).then(res=>{
            const {code, config} = res;
            if(code === 0){
                 this.props.form.setFieldsValue(config);
            }
        })
    }

    handleOk = ()=>{
        const {hideConfig} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values);
                post({url:SERVER_URL+`/sys/oss/saveConfig`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: '保存成功',
                            onOk: ()=>{ hideConfig() }
                        });
                    }else{
                        Modal.error({
                            title: res.msg
                        });
                    }
                })
            }
        })
    }

    isHidden = (type, value)=>type !== value
    isRequired = (type, value)=> false && type === value
    clearMsg = ()=>this.props.form.validateFields();

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const {visible, hideConfig } = this.props;
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

        const type = getFieldValue('type');
        return (
            <Modal
                title={"云存储配置"}
                visible={visible}
                onOk={this.handleOk}
                onCancel={hideConfig}
                maskClosable={false}
            >
                <Form>

                    <FromItem
                        {...formItemLayout}
                        label="存储类型"
                    >
                        {getFieldDecorator('type', {
                            rules: [{
                                required: true, message: '请选择类型!',
                            }],
                        })(
                            <Radio.Group onChange={this.clearMsg}>
                                <Radio value={1}>七牛</Radio>
                                <Radio value={2}>阿里云</Radio>
                                <Radio value={3}>腾讯云</Radio>
                            </Radio.Group>
                        )}
                    </FromItem>
                        <div hidden={this.isHidden(type,1)}>
                            <FromItem
                                {...formItemLayout}
                                label={"域名"}
                                hasFeedback
                            >
                                {getFieldDecorator('qiniuDomain', {
                                    rules: [{
                                        required: this.isRequired(type,1), message: `域名不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"七牛绑定的域名"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"路径前缀"}
                                hasFeedback
                            >
                                {getFieldDecorator('qiniuPrefix')(
                                    <Input placeholder={"不设置默认为空"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"AccessKey"}
                                hasFeedback
                            >
                                {getFieldDecorator('qiniuAccessKey', {
                                    rules: [{
                                        required: this.isRequired(type,1), message: `qiniuAccessKey不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"七牛AccessKey"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"SecretKey"}
                                hasFeedback
                            >
                                {getFieldDecorator('qiniuSecretKey', {
                                    rules: [{
                                        required: this.isRequired(type,1), message: `SecretKey不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"七牛SecretKey"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"空间名"}
                                hasFeedback
                            >
                                {getFieldDecorator('qiniuBucketName', {
                                    rules: [{
                                        required: this.isRequired(type,1), message: `七牛存储空间名不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"七牛存储空间名"} />
                                )}
                            </FromItem>
                        </div>
                        <div hidden={this.isHidden(type,2)}>
                            <FromItem
                                {...formItemLayout}
                                label={"域名"}
                                hasFeedback
                            >
                                {getFieldDecorator('aliyunDomain', {
                                    rules: [{
                                        required: this.isRequired(type,2), message: `域名不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"阿里云绑定的域名"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"路径前缀"}
                                hasFeedback
                            >
                                {getFieldDecorator('aliyunPrefix')(
                                    <Input placeholder={"不设置默认为空"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"EndPoint"}
                                hasFeedback
                            >
                                {getFieldDecorator('aliyunEndPoint', {
                                    rules: [{
                                        required: this.isRequired(type,2), message: `aliyunEndPoint不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"阿里云EndPoint"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"AccessKeyId"}
                                hasFeedback
                            >
                                {getFieldDecorator('aliyunAccessKeyId', {
                                    rules: [{
                                        required: this.isRequired(type,2), message: `阿里云AccessKeyId不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"阿里云AccessKeyId"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"AccessKeySecret"}
                                hasFeedback
                            >
                                {getFieldDecorator('aliyunAccessKeySecret', {
                                    rules: [{
                                        required: this.isRequired(type,2), message: `阿里云AccessKeySecret不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"阿里云AccessKeySecret"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"BucketName"}
                                hasFeedback
                            >
                                {getFieldDecorator('aliyunBucketName', {
                                    rules: [{
                                        required: this.isRequired(type,2), message: `阿里云BucketName不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"阿里云BucketName"} />
                                )}
                            </FromItem>
                        </div>
                        <div hidden={this.isHidden(type,3)}>
                            <FromItem
                                {...formItemLayout}
                                label={"域名"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudDomain', {
                                    rules: [{
                                        required: this.isRequired(type,3), message: `域名不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"腾讯云绑定的域名"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"路径前缀"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudPrefix')(
                                    <Input placeholder={"不设置默认为空"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"AppId"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudAppId', {
                                    rules: [{
                                        required: this.isRequired(type,3), message: `腾讯云AppId不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"腾讯云AppId"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"SecretId"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudSecretId', {
                                    rules: [{
                                        required: this.isRequired(type,3), message: `腾讯云SecretId不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"腾讯云SecretId"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"SecretKey"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudSecretKey', {
                                    rules: [{
                                        required: this.isRequired(type,3), message: `腾讯云SecretKey不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"腾讯云SecretKey"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"BucketName"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudBucketName', {
                                    rules: [{
                                        required: this.isRequired(type,3), message: `腾讯云BucketName不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"腾讯云BucketName"} />
                                )}
                            </FromItem>
                            <FromItem
                                {...formItemLayout}
                                label={"Bucket所属地区"}
                                hasFeedback
                            >
                                {getFieldDecorator('qcloudRegion', {
                                    rules: [{
                                        required: this.isRequired(type,3), message: `Bucket所属地区不能为空!`,
                                    }],
                                })(
                                    <Input placeholder={"如：sh（可选值 ，华南：gz 华北：tj 华东：sh）"} />
                                )}
                            </FromItem>
                        </div>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(OssConfig);
