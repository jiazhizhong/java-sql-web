import React from 'react';
import {withRouter} from "react-router-dom";
import './Login.css'
import FetchHttpClient, { json } from 'fetch-http-client';
import config from "./config";
import cookie from 'react-cookies'
import QRCode from 'qrcode.react'
import { Modal, Input } from 'antd';
import { UserOutlined,UnlockOutlined,VerifiedOutlined } from '@ant-design/icons';

const { confirm } = Modal;

class Login extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            userName: '',
            passWord: '',
            loginStep: 'LOGIN',
            authSecret: '',
            qrCode: '',
            otpPass: '',
            token: ''
        }
        this.handleInputChange = this.handleInputChange.bind(this)
    }
    handleInputChange(event){
        if('username' === event.target.name){
            this.setState({userName: event.target.value})
        }
        if('password' === event.target.name){
            this.setState({passWord: event.target.value})
        }
        if('otpPass' === event.target.name){
            this.setState({otpPass: event.target.value})
        }
    }
    login() {

        const client = new FetchHttpClient(config.serverDomain);
        client.addMiddleware(json());
        client.post('/user/login',{headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({userName: this.state.userName, passWord: this.state.passWord})})
            .then(response => {
                if(200 !== response.status){
                    confirm({
                        title:'提示',
                        content: '服务器连接失败',
                        onOk(){                        },
                        onCancel(){                        }
                    });
                }
                else if(response.jsonData.status){
                    //
                    // cookie.save('token', response.jsonData.data.token, {path: '/'})
                    // this.props.history.push('/');
                    if('BINDING' === response.jsonData.data.authStatus){
                        this.setState({
                            authSecret: response.jsonData.data.authSecret,
                            loginStep: 'BIND',
                            qrCode: 'otpauth://totp/'+response.jsonData.data.userName+'@'+window.location.host+'?secret='+response.jsonData.data.authSecret+'&issuer=JavaSqlWeb',
                            token: response.jsonData.data.token
                        })
                    }
                    else if('BIND' === response.jsonData.data.authStatus){
                        this.setState({
                            loginStep: 'VERIFY',
                            token: response.jsonData.data.token
                        })
                    }
                }
                else{
                    confirm({
                        title:'提示',
                        content: response.jsonData.message,
                        onOk(){                        },
                        onCancel(){                        }
                    });
                }
            })
            .catch(rejected => {
                confirm({
                    title:'提示',
                    content: '服务器连接失败',
                    onOk(){                        },
                    onCancel(){                        }
                });
            })
    }
    bindOtp() {
        const client = new FetchHttpClient(config.serverDomain);
        client.addMiddleware(json());
        client.post('/user/bindotp',{headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({token: this.state.token, otpPass: this.state.otpPass})})
        .then(response => {
            if(response.jsonData.status){
                cookie.save('token', this.state.token, {path: '/'})
                this.props.history.push('/');
            }
        })
    }
    verifyOtp() {
        const client = new FetchHttpClient(config.serverDomain);
        client.addMiddleware(json());
        client.post('/user/verifyotp',{headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({token: this.state.token, otpPass: this.state.otpPass})})
        .then(response => {
            if(response.jsonData.status){
                cookie.save('token', this.state.token, {path: '/'})
                this.props.history.push('/');
            }
            else{
                confirm({
                    title:'提示',
                    content: response.jsonData.message,
                    onOk(){                        },
                    onCancel(){                        }
                });
            }
        })
    }
    render(){
        return (
            <div className="center">

                <div className={this.state.loginStep === 'LOGIN'?'container':'hide'}>
                    <fieldset>
                    <legend>登录</legend>
                    <div className="item">
                    <Input prefix={<UserOutlined />} placeholder="用户名" name="username" onChange={this.handleInputChange} />
                    </div>
                    <div className="item">
                    <Input.Password prefix={<UnlockOutlined />} placeholder="密码" name="password" onChange={this.handleInputChange} onPressEnter={this.login.bind(this)} />
                    </div>    
                    </fieldset>
                    <fieldset className="tblFooters">
                    <input className="btn btn-primary" value="Login" type="submit" id="input_go" onClick={this.login.bind(this)} />
                    </fieldset>
                </div>
                <div className={this.state.loginStep === 'BIND'?'container':'hide'}>
                    <fieldset>
                        <legend>绑定OTP</legend>
                        <div className="item qrcode">
                        <label>
                        使用手机 Google Authenticator 应用扫描以下二维码<br></br>
                        <a href="https://github.com/google/google-authenticator-android/releases">安卓版本</a><br />
                        <a href="https://apps.apple.com/cn/app/google-authenticator/id388497605">iOS版本</a>
                        </label>
                        <br></br>
                        <QRCode value={this.state.qrCode}></QRCode>
                        <br></br>
                        <label>Secret: {this.state.authSecret}</label>
                        </div>
                        <div className="item">
                        <Input prefix={<VerifiedOutlined />} placeholder="双因子动态码" name="otpPass" onChange={this.handleInputChange}  onPressEnter={this.bindOtp.bind(this)} />
                        </div>
                    </fieldset>
                    <fieldset className="tblFooters">
                        <input className="btn btn-primary" value="BIND" type="submit" id="input_go" onClick={this.bindOtp.bind(this)} />
                    </fieldset>
                </div>
                <div className={this.state.loginStep === 'VERIFY'?'container':'hide'}>
                <fieldset>
                        <legend>验证OTP</legend>
                        <div className="item">

                        
                        <Input prefix={<VerifiedOutlined />} placeholder="双因子动态码" name="otpPass" onChange={this.handleInputChange}  onPressEnter={this.verifyOtp.bind(this)} />

                        </div>
                    </fieldset>
                    <fieldset className="tblFooters">
                        <input className="btn btn-primary" value="Verify" type="submit" id="input_go" onClick={this.verifyOtp.bind(this)} />
                    </fieldset>
                </div>
            </div>

        )
    }
}

export default withRouter(Login);