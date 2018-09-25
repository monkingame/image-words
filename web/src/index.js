import React from 'react';
import ReactDOM from 'react-dom';
//TODO:->remove redux
// import { createStore, applyMiddleware } from 'redux';
// import { Provider } from 'react-redux';
// import { createLogger } from 'redux-logger';
// import thunk from 'redux-thunk';
//TODO:<-remove redux
import ApolloClient, { InMemoryCache } from "apollo-boost";
import { ApolloProvider } from "react-apollo";

//TODO:->remove redux
// import reducers from './reducers'
// import { BrowserRouter as Router } from 'react-router-dom';
//TODO:<-remove redux
import App from './App';
import { defaults, } from "./graphql/defaults";
import { resolvers, } from "./graphql/resolver";
import { typeDefs } from "./graphql/typeDefs";

//TODO:->remove redux
// const middleware = [thunk];
// if (process.env.NODE_ENV !== 'production') {
//   middleware.push(createLogger());
// }
// const store = createStore(reducers, applyMiddleware(...middleware));
//TODO:<-remove redux

const client = new ApolloClient({
  // uri: "http://localhost:3001/gql",
  uri: process.env.REACT_APP_GRAPHQL_SERVER,
  clientState: {
    defaults,
    resolvers,
    typeDefs,
  },
  cache: new InMemoryCache(),
});

ReactDOM.render(
  //TODO:->remove redux
  // <Provider store={store}>
  //   <ApolloProvider client={client}>
  //     <App />
  //   </ApolloProvider>
  // </Provider >,
  //TODO:<-remove redux

  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,

  document.getElementById('root')
);
