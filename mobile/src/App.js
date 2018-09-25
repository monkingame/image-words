import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, } from 'react-native';
// import { connect } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { compose, withApollo } from 'react-apollo';

// import { getStsTime, getStsToken } from './sts/Util';
// import { postOssSts } from './sts/actions';
// import { pageRefreshList, refreshListStarted } from './list/actions';
import { MainPage } from './main';
import { UserPanel } from './user';
import { UserFavorite } from './favorite';
import { About } from './about';
//react-native-tabs
import Tabs from './components/TabBar';
import {
  getDimensionWidth, getDimensionHeight,
  HEIGHT_TOP_STATUS_BAR, HEIGHT_TOP_CTRL_BAR, HEIGHT_BOTTOM_TAB_BAR,
  WIDTH_CHILD, HEIGHT_CHILD, MARGIN_CHILD, LEFT_CHILD, TOP_CHILD,
} from './util/DimesionUtil';
import EulaInfo from './components/EulaInfo';
import { withMetadataQuery } from './graphql/WithQuery';
import { withMutLocalLoginedUser, } from './graphql/WithMutation';
import { INTERNAL_FETCH_STS, } from './util/GlobalConst';
import { VARIABLES_CLIENT_IDENTIFY } from './util/GlobalConst';
import { getLocalStorageLoginedUser, setLocalStorageLoginedUser } from './user/Util';
import { QUERY_METADATA, } from './graphql/GQLQuery';
import { QUERY_USER_BY_TOKEN, } from './graphql/GQLQuery';
import { ButtonCommon, BUTTON_TYPE_REFRESH, } from './components/button';

// import { isoDate2LocaleDate, isoDate2LocaleString, } from './util/CommonUtil';



//STS定时器间隔为55分钟（55*60*1000），防止一小时（STS key超时期限）后STS key过期
// const INTERNAL_FETCH_STS = 55 * 60 * 1000;

const TAB_SHUOSHUO = 'shuoshuo';
const TAB_USER = 'user';
const TAB_ABOUT = 'about';

class App extends Component {

  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      // TODO: 如果page不是TAB_SHUOSHUO，就是因为临时测试才修改的
      page: TAB_SHUOSHUO,
      inited: false,
      checked: false,
      time: (new Date()).getTime(),
    };
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  // 定时器 每隔55分钟拉取一次oss sts key
  tick = () => {
    const { time, } = this.state;
    const { client, } = this.props;
    const now = (new Date()).getTime();
    // console.log('App tick: ', isoDate2LocaleString(now), (now - time) / 1000);

    // if (interval > INTERNAL_FETCH_STS) {
    // if ((now - time) > 5 * 1000) {
    if ((now - time) > INTERNAL_FETCH_STS) {
      client.query({
        query: QUERY_METADATA,
        variables: VARIABLES_CLIENT_IDENTIFY,
        fetchPolicy: 'network-only',
      });
      // console.log('Now got got got: ', isoDate2LocaleString(now));
      this.setState({ time: now });
    }
  }


  // @2018-07-03 14:13:40
  verifyLocalLoginedUser = async (metadata) => {
    if (this.state.checked) return true;
    // console.log('App verifyLocalLoginedUser 检查用户 ');

    // TODO: react-native的local storage在调试模式下有问题
    const loginedUser = await getLocalStorageLoginedUser(metadata);
    // console.log('App verifyLocalLoginedUser getLocalStorageLoginedUser: ', loginedUser);

    if (!loginedUser) return false;
    const { client, updateLoginedUser, } = this.props;

    const { data } = await client.query({
      query: QUERY_USER_BY_TOKEN,
      variables: { token: loginedUser.token },
    });

    const { userByToken } = data;
    // // 更新token用户
    // if (userByToken) {
    //   client.writeQuery({
    //     query: QUERY_USER_BY_TOKEN,
    //     data: { userByToken },
    //     variables: { token: userByToken.token },
    //   });
    // }

    // console.log('App verifyLocalLoginedUser: ', loginedUser);

    const valid = userByToken && (!userByToken.deleted);
    if (!valid) {
      await setLocalStorageLoginedUser(null, metadata);
    }

    updateLoginedUser({
      variables: {
        loginedUser: valid ? loginedUser : null,
      }
    });
    this.setState({ checked: true });

    return valid;
  }

  async componentDidMount() {

    // console.log(getDimensionWidth(), getDimensionHeight());

    // 每隔10秒钟
    // WTF!!!AsyncStorage无法getItem，所以timer放在getItem后面会被阻止
    // TODO:经过测试，RN的timer警告阀值在60秒
    // https://github.com/facebook/react-native/issues/12981#issuecomment-292946311
    this.timer = setInterval(this.tick, 30 * 1000);
  }

  async componentWillReceiveProps(nextProps) {
    const metadataOld = this.props.metadata;
    const metadataNext = nextProps.metadata;
    if ((metadataOld !== metadataNext) && metadataNext) {
      // console.log('App componentWillReceiveProps : ', metadataNext);
      await this.verifyLocalLoginedUser(metadataNext);
    }
  }

  handleReconnect = async () => {
    const { refetch, } = this.props;
    refetch();
  }

  renderComponent = () => {
    const { page } = this.state;
    if (page === TAB_SHUOSHUO) return (<MainPage />);
    // if (page === TAB_USER) return (<UserPanel />);
    if (page === TAB_USER) return (<UserFavorite />);
    if (page === TAB_ABOUT) return (<About />);

    return null;
  }

  renderWaiting = () => {
    return (<View style={styles.statusMessage}>
      <View style={{ flex: 1 }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'blue' }}>{`看图说说载入中...`}</Text>
        <Text style={{ color: 'blue' }}>{`请耐心等待`}</Text>
      </View>
    </View>);
  }

  renderErrorMsg = (err) => {
    return (<View style={styles.statusMessage}>
      <View style={{ flex: 1 }}>
        <Text>{"出错了"}</Text>
        <Text style={{ color: 'red' }}>{`${err}`}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ButtonCommon
          type={BUTTON_TYPE_REFRESH}
          onPress={this.handleReconnect}
          text={`重新连接`}
        />
      </View>
    </View>);
  }

  render() {
    const { loading, error, metadata, } = this.props;
    // console.log('App status: ', loading, error);

    if (error) return this.renderErrorMsg(error);
    if (loading) return this.renderWaiting();

    if (!metadata) {
      return (<View style={styles.statusMessage}>
        <Text style={{ color: 'red' }}>{`不支持的版本或其他错误`}</Text>
      </View>);
    }

    return (
      <View style={styles.container} >
        <View style={{ flex: 1 }}>
          {this.renderComponent()}
        </View>

        <Tabs selected={this.state.page} style={styles.tab}
          selectedStyle={{ color: 'white' }} onSelect={el => this.setState({ page: el.props.name })}>
          <Text name={TAB_SHUOSHUO}><FontAwesome size={24} name="home" />{'说说'}</Text>
          <Text name={TAB_USER}><FontAwesome size={24} name="user" />{'我的'}</Text>
          <Text name={TAB_ABOUT}><FontAwesome size={24} name="sitemap" />{'关于'}</Text>
        </Tabs>

      </View>
    );
  }
}


// export default App;
export default compose(
  withApollo,
  withMetadataQuery(),
  withMutLocalLoginedUser(),
)(App);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    left: 0,
    top: HEIGHT_TOP_STATUS_BAR,
    width: getDimensionWidth(),
    height: getDimensionHeight() - HEIGHT_TOP_STATUS_BAR,
    // borderWidth: 3,
    // borderColor: 'red',
    position: 'absolute',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#F5FCFF',
    // marginTop: 20,//ios上端有系统栏空间，需要预留
  },
  statusMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F5FCFF',
    // marginTop: 20,//ios上端有系统栏空间，需要预留
    marginVertical: 50,
  },
  tab: {
    backgroundColor: '#66796B',
    // borderWidth: 5,
    // borderColor: 'blue',
  },
});

