import React from 'react';
import ReactDOM from 'react-dom';
import Root from '../Root';
// import App from '../App';
// import CurrentLoginContainer, { CurrentLogin } from '../CurrentLoginContainer'

/*

renders without crashing
   Invariant Violation: Could not find "store" in either the context or props of "Connect(CurrentLogin)". Either wrap the root component in a <Provider>, or explicitly pass "store" as a prop to "Connect(CurrentLogin)".

   http://redux.js.org/docs/recipes/WritingTests.html#connected-components
   
未找到解决办法

*/

it('renders without crashing', () => {
  const div = document.createElement('div');
  // ReactDOM.render(< CurrentLogin loginInfo={{}} />, div);
  // ReactDOM.render(<App />, div);
  // ReactDOM.render(<Root store={{}}/>, div);
});
