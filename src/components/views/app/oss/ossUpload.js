import React from 'react';
import {Modal, Upload, Icon} from "antd";
import {SERVER_URL} from '@/axios/config'

class ossUpload extends React.Component {
    state = {
        uploadUrl: null,
        fileList:[],
    }

    componentDidMount(){
        this.setState({
            uploadUrl: SERVER_URL+`/sys/oss/upload?token=${sessionStorage.getItem('token')}`
        });
    }

    onCancel = ()=>{
        this.props.hideUpload();
        this.setState({
            fileList:[],
        });
    }

    beforeUpload = (file, fileList)=>{
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
            Modal.error({
                title: '只支持jpg、png、gif格式的图片！'
            });
            return false
        }
    }
    onChange = ({file,event,fileList})=>{
        console.log(file,event,fileList);
        if(file.status==='done' && file.response && file.response.code === 0) {
            Modal.confirm({
                title:"上传成功, 是否继续上传?",
                onOk:()=>{},
                onCancel:()=>{
                    this.onCancel();
                },
            })
        }
        this.setState({ fileList: [...fileList] });
    }

    render(){
        const {visible } = this.props;
        return (

            <Modal
                title={"上传文件"}
                visible={visible}
                onCancel={this.onCancel}
                maskClosable={false}
                footer={null}
            >
                <Upload.Dragger
                    name="file"
                    accept={".jpg,.png,.gif"}
                    beforeUpload={this.beforeUpload}
                    action={this.state.uploadUrl}
                    onChange={this.onChange}
                    fileList={this.state.fileList}
                >
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件上传</p>
                    <p className="ant-upload-hint">只支持jpg、png、gif格式的图片！</p>
                </Upload.Dragger>

            </Modal>
        );
    }
}

export default ossUpload;
