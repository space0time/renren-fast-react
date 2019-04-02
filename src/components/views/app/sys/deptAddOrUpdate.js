import React, { Component } from 'react'
import {Form, Input, InputNumber, Modal, TreeSelect} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import {isAuth, treeDataTranslate } from '@/utils'

const FormItem = Form.Item;

class DeptAddOrUpdate extends Component {

    state = {
        treeData:[],
    }

    componentDidMount(){
        isAuth('sys:dept:select') &&(
            get({url:'/sys/dept/select'}).then(res => {
                const data = treeDataTranslate(res.deptList, 'deptId');
                this.setState({
                    treeData: data,
                })
            })
        )

    }

    handleOk = ()=> {
        const {deptId, saveDeptSuccess} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.deptId = deptId;
                post({url:`/sys/dept/${!deptId ? 'save' : 'update'}`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !deptId ?'保存成功':'修改成功',
                            onOk: ()=>{ saveDeptSuccess() }
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

    render() {

        const { getFieldDecorator } = this.props.form;
        const {deptId, visible, cancelAdd } = this.props;
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
            <Modal
                title={deptId?"修改":"新增"}
                visible={visible}
                onOk={this.handleOk}
                onCancel={cancelAdd}
                maskClosable={false}
            >
                <Form>

                    <FormItem
                        {...formItemLayout}
                        label="部门名称"
                        hasFeedback
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true, message: '部门名称不能为空!',
                            }],
                        })(
                            <Input placeholder="部门名称" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="上级部门"
                    >
                        {getFieldDecorator('parentId', {
                            rules: [{
                                required: true, message: '请选择上级部门!',
                            }],
                        })(
                            <TreeSelect
                                dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                                treeData={this.state.treeData}
                                placeholder="请选择上级部门"
                            />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="排序号"
                        hasFeedback
                    >
                        {getFieldDecorator('orderNum', {
                            rules: [{
                                required: true, message: '请输入排序号!',
                            }],
                        })(
                            <InputNumber min={0} />
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
    const { deptData } = props;
    const data = Object.keys(deptData).reduce((obj, key) => {
        obj[key] = Form.createFormField({value:deptData[key]});
        return obj
    },{});
    return data;
}

export default Form.create({mapPropsToFields})(DeptAddOrUpdate);
