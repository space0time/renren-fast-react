/**
 * Created by 叶子 on 2017/8/13.
 */
import React, {Component} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import AllComponents from '../components';
import queryString from 'query-string';
import NotFound from "../components/pages/NotFound";
import Loadable from 'react-loadable';
import Loading from '../components/widget/Loading';

export default class CRouter extends Component {

    state = {
        menuList:null
    }
    componentWillReceiveProps (nextProps) {
        this.setState({
            menuList:nextProps.menuList
        });

    }

    requireAuth = (permission, component) => {
        // const { permissions } = this.props;
        const permissions = JSON.parse(sessionStorage.getItem('permissions'));
        // const { auth } = store.getState().httpData;
        if (!permissions || !permissions.includes(permission)) return <Redirect to={'404'} />;
        return component;
    };
    requireLogin = (component, permission) => {
        //const { permissions } = this.props;
        const permissions = JSON.parse(sessionStorage.getItem('permissions'));
        if (process.env.NODE_ENV === 'production' && !permissions) { // 线上环境判断是否登录
            return <Redirect to={'/login'} />;
        }
        return permission ? this.requireAuth(permission, component) : component;
    };

    render() {
        const menuList = this.state.menuList;

        if(!menuList){
            return (<div />)
        }
        return (
            <Switch>
                {
                    // Object.keys(menuList).map(key =>
                        menuList.map(r => {
                            const route = r => {
                                let Component = AllComponents[r.component];
                                return (
                                    <Route
                                        key={r.route || r.key}
                                        exact
                                        path={r.route || r.key}
                                        render={(props) => {
                                            const reg = /\?\S*/g;
                                            // 匹配?及其以后字符串
                                            const queryParams = window.location.hash.match(reg);
                                            // 去除?的参数
                                            const { params } = props.match;
                                            Object.keys(params).forEach(key => {
                                                params[key] = params[key] && params[key].replace(reg, '');
                                            });
                                            props.match.params = { ...params };
                                            const merge = { ...props, query: queryParams ? queryString.parse(queryParams[0]) : {} };

                                            if (r.url) {
                                                return (
                                                    <iframe src={r.url}
                                                            width="100%"
                                                            height="100%"
                                                            frameBorder="0"
                                                            scrolling="yes"
                                                            title={r.route || r.key}
                                                    />
                                                )
                                            }

                                            if(!Component){
                                                try {
                                                    // 开发环境不使用懒加载, 因为懒加载页面太多的话会造成webpack热更新太慢, 所以只有生产环境使用懒加载
                                                    if(process.env.NODE_ENV === 'production'){
                                                        Component = Loadable({
                                                            loader: () => import('@/components/views' + r.key + '.js'),
                                                            loading: Loading,
                                                        })
                                                    }else{
                                                        Component = require('@/components/views' + r.key + '.js').default;
                                                    }
                                                }catch (e) {}

                                                if(!Component){
                                                    Component = NotFound;
                                                    // return <NotFound />
                                                }
                                            }

                                            return r.login
                                                ? <Component {...merge} />
                                                : this.requireLogin(<Component {...merge} />, r.auth)
                                        }}
                                    />
                                )
                            }
                            return r.component||r.url ? route(r) : (r.subs?r.subs.map(r => route(r)):route(r));
                        })
                    // )
                }

                <Route render={() => <Redirect to="/404" />} />
            </Switch>
        )
    }
}
