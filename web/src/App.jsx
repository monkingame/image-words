import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Row, Col, Avatar, BackTop } from 'antd';
import 'antd/dist/antd.css';
import { compose, withApollo } from 'react-apollo';

import { MainPage } from './main/';
import { About } from './about/';
import { Admin } from './admin/';
import { UserPanel } from './user/';
import RouteNotFound from './components/NotFound';
import './css/App.css';

import { withMetadataQuery } from './graphql/WithQuery';
import { withMutLocalLoginedUser, } from './graphql/WithMutation';
import { INTERNAL_FETCH_STS } from './util/GlobalConst';
import { VARIABLES_CLIENT_IDENTIFY } from './util/GlobalConst';
import { getLocalStorageLoginedUser, setLocalStorageLoginedUser, } from './util/LocalStore';
import { QUERY_METADATA, } from './graphql/GQLQuery';
import { QUERY_USER_BY_TOKEN, } from './graphql/GQLQuery';

const { Header, Content, Footer } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    // this.timer = null;
    this.state = {
      selectedMenuKeys: ['Home'],
      inited: false,
    };
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log('App componentWillReceiveProps: ', nextProps);

  //   // if (nextProps.data) {
  //   //   const { metadata, } = nextProps.data;
  //   //   if (metadata) {
  //   //     const { client, } = nextProps;
  //   //     // UpdateLocalMetadata({ client, metadata });
  //   //   }
  //   // }
  //   // const { metadata, client, updateLoginedUser } = nextProps;
  //   const { metadata, updateLoginedUser } = nextProps;
  //   if (metadata) {
  //     // console.log('App componentWillReceiveProps: ', metadata);
  //     const loginedUser = getLocalStorageLoginedUser(metadata);
  //     // console.log('App reload loginedUser: ', loginedUser);
  //     // UpdateLocalLoginedUser({ client, login: loginedUser });
  //     updateLoginedUser({
  //       variables: {
  //         loginedUser,
  //       }
  //     });
  //   }
  // }

  // @2018-06-28 18:30:02
  // 检查用户是否有效
  checkUserByLocalLogined = async (loginedUser) => {
    if (!loginedUser) return null;
    const { client, } = this.props;

    const { data } = await client.query({
      query: QUERY_USER_BY_TOKEN,
      variables: { token: loginedUser.token },
    });

    const { userByToken } = data;
    if (!userByToken || userByToken.deleted) return null;
    return userByToken;
  }

  async componentDidMount() {
    const { client, metadata, updateLoginedUser } = this.props;
    // console.log('App componentDidMount: ', client, metadata);
    if (!metadata) {
      const { data } = await client.query({
        query: QUERY_METADATA,
        variables: VARIABLES_CLIENT_IDENTIFY,
      });
      // console.log('App componentDidMount: ', data);
      if (data) {
        const got = data.metadata;
        if (got && got.ossToken) {
          // console.log('App componentDidMount: ', got);
          const loginedUser = getLocalStorageLoginedUser(got);
          // @2018-06-28 18:29:29
          // 检查用户是否有效
          const checkedUser = await this.checkUserByLocalLogined(loginedUser);
          // console.log('App componentDidMount checkedUser: ', checkedUser);
          if (!checkedUser) {
            setLocalStorageLoginedUser(null, got);
          }

          updateLoginedUser({
            variables: {
              loginedUser: checkedUser ? loginedUser : null,
            }
          });

          this.setState({ inited: true });
        }
      }
    }
  }


  clickUser = () => {
    //TODO:当点击用户按钮时，菜单应该取消选择状态
    this.setState({ selectedMenuKeys: [] });
  }

  onMenuSelect = (item, key, selectedKeys) => {
    if (item) {
      this.setState({ selectedMenuKeys: item.keyPath });
    }
  }

  render() {
    // console.log(this.props);
    // console.log(this.state.inited);

    if (!this.state.inited) return null;

    const { loading, error, metadata, } = this.props;
    // console.log('App metadata: ', loading, error, metadata);

    if (error) {
      return (
        <div style={{ color: "#ff0000" }}>
          {`${error}`}
          {`发生未知错误，请检查网络或客户端版本`}
        </div>
      );
      // console.log(`QUERY_METADATA error : ${error}`);
    }

    if (loading || !metadata) {
      return <div>载入中...</div>;
    }

    // const { metadata } = data;
    if (!metadata) {
      return <div>未知版本或出现其他错误</div>;
    }

    return (
      // <div>
      //   {this.props.children}
      // </div>


      <Router>

        <div className="component-app empty-bkgcolor">
          <Row className="app-row">
            <Col span={4} className="empty-left"></Col>
            <Col span={16} className="col-main ">
              <Layout>
                <Row>
                  <Col span={24}>
                    <Header className="fixed-position header-vertical-center">
                      <Col span={2} className="header-logo">LOGO</Col>
                      <Col span={14} className="col-header-menu">
                        <Menu
                          theme="dark"
                          mode="horizontal"
                          // defaultSelectedKeys={['Home']}
                          className="menu"
                          selectedKeys={this.state.selectedMenuKeys}
                          onSelect={this.onMenuSelect}
                        >
                          <Menu.Item key="Home"><Link to="/">{"看图说说"}</Link></Menu.Item>
                          {/* <Menu.Item key="Reg"><Link to="/reg">注册</Link></Menu.Item>
                          <Menu.Item key="Login"><Link to="/login">登录</Link></Menu.Item> */}
                          <Menu.Item key="About"><Link to="/about">{"关于"}</Link></Menu.Item>
                          {/* <Menu.Item key="Admin"><Link to="/admin">{"管理"}</Link></Menu.Item> */}
                        </Menu>
                      </Col>
                      <Col span={6} />
                      <Col span={2}>
                        <Link to="/user" onClick={this.clickUser}>
                          <Avatar icon="user" className="user-icon" />
                        </Link>
                      </Col>
                    </Header>
                  </Col>
                </Row>


                <Row>
                  <Content className="main-content-style">
                    <Switch>
                      <Route exact path="/" component={MainPage} />
                      {/* <Route path="/reg" component={RegisterContainer} />
                      <Route path="/login" component={LoginContainer} /> */}
                      {/* <Route path="/postnew" component={PostNew} /> */}
                      <Route path="/about" component={About} />
                      <Route path="/user" component={UserPanel} />
                      <Route path="/admin" component={Admin} />
                      <Route component={RouteNotFound} />
                    </Switch>
                  </Content>
                </Row>

                <Row>
                  <Col span={24}>
                    <Footer >
                      {"看图说说 ©2017"}<br />
                      <a href='http://www.miitbeian.gov.cn/' rel='noopener noreferrer' target='_blank'>{'鲁ICP备18001419号'}</a>
                    </Footer>
                  </Col>
                </Row>
              </Layout>
            </Col>
            <Col span={4} className="empty-right"></Col>
          </Row>

          <BackTop />

        </div>

      </Router>

    );
  }
}



// export default () => (
//   <Query query={QUERY_METADATA} variables={{
//     clientId: {
//       clientVersion: `1.000.100`,
//       clientIdentifyKey: `web-client-image-word`,
//     }
//   }}
//     pollInterval={INTERNAL_FETCH_STS}
//   >
//     {props => <App {...props} />}
//   </Query>
// );


// export default () => (
//   <Query query={QUERY_METADATA} variables={VARIABLES_CLIENT_IDENTIFY}
//     pollInterval={INTERNAL_FETCH_STS}
//   >
//     {props => <App {...props} />}
//   </Query>
// );

// export default compose(
//   withApollo,
//   graphql(QUERY_METADATA, {
//     name: `metadata`,
//     props: ({ metadata: { metadata, error, loading } }) => ({ metadata, error, loading }),
//     options: () => ({ variables: VARIABLES_CLIENT_IDENTIFY, pollInterval: INTERNAL_FETCH_STS }),
//   }),
// )(App);

export default compose(
  withApollo,
  withMetadataQuery(INTERNAL_FETCH_STS),
  withMutLocalLoginedUser(),
)(App);

