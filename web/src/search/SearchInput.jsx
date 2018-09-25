import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { postSearchWords } from './actions';
// import { Input, Spin } from 'antd';
import { Input, } from 'antd';
import 'antd/dist/antd.css';
import { compose, } from "react-apollo";

// import { searchWordsStarted, pageSearchWords } from './actions';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
// import { inBusySearching } from '../status/Util';
// import { newSearchStarted } from './Util';
import { withMutLocalSearchStatus } from '../graphql/WithMutation';

const Search = Input.Search;

class SearchInput extends Component {

  constructor(props) {
    super(props);
    this.state = { keyword: '' };
  }

  //TODO:设置输入最大长度
  handleSearch = async (value) => {
    if (!value || !value.trim()) {
      return;
    }
    if (value.length > WORDS_MAX_LENGTH) {
      return;
    }

    // const { searchStart, pageSearch } = this.props;
    // searchStart();
    // pageSearch(value);

    const { updateLocalSearchStatus } = this.props;
    await updateLocalSearchStatus({
      variables: {
        searchStatus: {
          inSearch: true,
          keyword: value,
        },
      }
    });
  }

  handleChange = (e) => {
    let { value } = e.target;
    if (value.length >= WORDS_MAX_LENGTH) {
      value = value.substring(0, WORDS_MAX_LENGTH);
    }
    this.setState({ keyword: value });
  }

  render() {
    // console.log("SearchInput busySearching:", this.props.busySearching);

    return (
      <div>
        {/* <Spin spinning={this.props.busySearching}> */}
        <Search placeholder={`搜索(最多${WORDS_MAX_LENGTH}字符)`}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
          value={this.state.keyword}
          enterButton
          size="default" />
        {/* </Spin> */}
      </div>
    );
  }
}

export default compose(
  // withApollo,
  withMutLocalSearchStatus(),
)(SearchInput);

