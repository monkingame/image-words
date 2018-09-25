import React from 'react';
import { AppRegistry } from 'react-native';
// import { createStore, applyMiddleware } from 'redux';
// import { Provider } from 'react-redux';
// import { createLogger } from 'redux-logger';
// import thunk from 'redux-thunk';
import ApolloClient, { InMemoryCache } from "apollo-boost";
import { ApolloProvider } from "react-apollo";
// 警告调整
// import { YellowBox } from 'react-native';

import App from './src/App';
// import reducers from './src/reducers'
// @2018-07-24 10:10:36
// import { defaults, resolvers, typeDefs } from "./src/graphql/resolver";
import { defaults, } from "./src/graphql/defaults";
import { resolvers, } from "./src/graphql/resolver";
import { typeDefs } from "./src/graphql/typeDefs";

import { URI_GRAPHQL_SERVER } from './src/util/GlobalConst';

// const middleware = [thunk];
// if (process.env.NODE_ENV !== 'production') {
//   middleware.push(createLogger());
// }
// const store = createStore(reducers, applyMiddleware(...middleware));

const client = new ApolloClient({
  // uri: "http://localhost:3001/gql",
  // uri: "http://192.168.1.105:3001/gql",
  uri: URI_GRAPHQL_SERVER,
  clientState: {
    defaults,
    resolvers,
    typeDefs,
  },
  cache: new InMemoryCache(),
});

// console.log('Apollo client is : ', client);

// TODO: 临时关闭timer警告 还需要调整时间参数 使用正确的方式（Android下）
// console.ignoredYellowBox = ['Setting a timer'];
// YellowBox.ignoreWarnings([
//   'Warning: isMounted(...) is deprecated',
//   'Setting a timer',
// ]);

// 关闭黄色警告信息 @2018-08-07 15:54:25
console.disableYellowBox = true;

const appMain = () => {
  // console.log(store);
  return (
    // <Provider store={store}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
    // </Provider >
  );
}

AppRegistry.registerComponent('mobile', () => appMain);
