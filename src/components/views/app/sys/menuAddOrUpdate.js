import React, { Component } from 'react'
import {Form, Input, Modal, Radio, InputNumber, TreeSelect, Popover, Icon, Button} from "antd";
import { get, post } from '@/axios/tools'
import {SERVER_URL} from '@/axios/config'
import { treeDataTranslate } from '@/utils'
import './iconSelect.less'
import {isAuth} from '@/utils'

const FormItem = Form.Item;

class MenuAddOrUpdate extends Component{


    state = {
        treeData:[],
    }

    componentDidMount(){
        isAuth('sys:menu:select') &&(
        get({url:'/sys/menu/select'}).then(res => {
            const data = treeDataTranslate(res.menuList, 'menuId');
            this.setState({
                treeData: data,
            })
        })
        )

    }
    handleOk = ()=>{
        const {menuId, saveMenuSuccess} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values);
                values.menuId = menuId;
                post({url:`/sys/menu/${!menuId ? 'save' : 'update'}`,
                    data:values
                }).then(res =>{
                    if(res.code === 0) {
                        Modal.success({
                            title: !menuId ?'保存成功':'修改成功',
                            onOk: ()=>{ saveMenuSuccess() }
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

    chooseIcon = (icon)=>{
        this.props.form.setFieldsValue({icon:icon});
    }

    render(){
        const icons = ['setting',
            'user',
            'team',
            'solution',
            'menu',
            'database',
            'clock-circle',
            'code',
            'file-text',
            'cloud-upload',
            'mobile',
            'scan',
            'rocket',
            'copy',
            'edit',
            'area-chart',
            'switcher',
            'safety',
            'star',
            'bars',];
        const iconsList = icons.map((icon, i) => (
                <Button key={i} onClick={()=>this.chooseIcon(icon)}>
                    <Icon type={icon} />
                </Button>
        ));

        const content = (
            <div className={'__icon-list'}>
                    {iconsList}
            </div>
        );

        const { getFieldDecorator } = this.props.form;
        const {menuId, visible, cancelAdd } = this.props;
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

        const type = this.props.form.getFieldValue('type');
        const label = type===1?"菜单名称":(type===0?"目录名称":"按钮名称");
        return (
            <Modal
                title={menuId?"修改":"新增"}
                visible={visible}
                onOk={this.handleOk}
                onCancel={cancelAdd}
                maskClosable={false}
            >
                <Form>

                    <FormItem
                        {...formItemLayout}
                        label="类型"
                    >
                        {getFieldDecorator('type', {
                            rules: [{
                                required: true, message: '请选择类型!',
                            }],
                        })(
                            <Radio.Group>
                                <Radio value={0}>目录</Radio>
                                <Radio value={1}>菜单</Radio>
                                <Radio value={2}>按钮</Radio>
                            </Radio.Group>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label={label}
                        hasFeedback
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true, message: `${label}不能为空!`,
                            }],
                        })(
                            <Input placeholder={label} />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="上级菜单"
                    >
                        {getFieldDecorator('parentId', {
                            rules: [{
                                required: true, message: '请选择上级菜单!',
                            }],
                        })(
                            <TreeSelect
                                dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                                treeData={this.state.treeData}
                                placeholder="请选择上级菜单"
                            />
                        )}
                    </FormItem>
                    {type === 1 && (
                    <FormItem
                        {...formItemLayout}
                        label="菜单路由"
                        hasFeedback
                    >
                        {getFieldDecorator('url', {
                            rules: [{
                                required: true, message: '请输入菜单路由!',
                            }],
                        })(
                            <Input placeholder="菜单路由" />
                        )}
                    </FormItem>
                    )}
                    {(type === 1 || type===2) && (
                    <FormItem
                        {...formItemLayout}
                        label="授权标识"
                    >
                        {getFieldDecorator('perms')(
                            <Input placeholder={'多个用逗号分隔, 如: user:list,user:create'} />
                        )}
                    </FormItem>
                    )}
                    {(type === 1 || type===0) && (
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
                    )}
                    {(type === 1 || type===0) && (
                    <FormItem
                        {...formItemLayout}
                        label="菜单图标"
                    >
                        <Popover placement="topLeft" content={content} trigger="click">
                            {getFieldDecorator('icon')(
                                <Input />
                            )}
                        </Popover>
                    </FormItem>
                    )}
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
    const { menuData } = props;
    const data = Object.keys(menuData).reduce((obj, key) => {
        obj[key] = Form.createFormField({value:menuData[key]});
        return obj
    },{});
    return data;
}

export default Form.create({mapPropsToFields})(MenuAddOrUpdate);
