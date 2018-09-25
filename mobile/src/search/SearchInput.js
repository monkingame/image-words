
import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { View, TextInput, StyleSheet } from 'react-native';
import { compose, } from "react-apollo";

// import { searchWordsStarted, pageSearchWords } from './actions';
// import { inBusySearching } from '../status/Util';
import ButtonCommon from '../components/button/ButtonCommon';
import { BUTTON_TYPE_SEARCH } from '../components/button/ButtonConst';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
import { withMutLocalSearchStatus } from '../graphql/WithMutation';


class SearchInput extends Component {

  constructor(props) {
    super(props);
    this.state = { keyword: '' };
  }

  // handleSearch = (value) => {
  //   if (!value || !value.trim()) {
  //     return;
  //   }
  //   if (value.length > WORDS_MAX_LENGTH) {
  //     return;
  //   }
  //   const { searchStart, pageSearch } = this.props;
  //   searchStart();
  //   pageSearch(value);
  // }

  handleSearch = async () => {
    const { keyword } = this.state;
    // console.log(keyword);
    if (!keyword || !keyword.trim()) {
      return;
    }
    if (keyword.length > WORDS_MAX_LENGTH) {
      return;
    }
    // const { searchStart, pageSearch } = this.props;
    // searchStart();
    // pageSearch(keyword);

    const { updateLocalSearchStatus } = this.props;
    await updateLocalSearchStatus({
      variables: {
        searchStatus: {
          inSearch: true,
          keyword,
        },
      }
    });
  }

  // handleChange = (value) => {
  //   this.setState({ keyword: value });
  // }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            value={this.state.keyword}
            placeholder={`搜索(最多${WORDS_MAX_LENGTH}字符)`}
            onSubmitEditing={this.handleSearch}
            // onChangeText={this.handleChange}
            onChangeText={(keyword) => { this.setState({ keyword }) }}
            maxLength={WORDS_MAX_LENGTH}
            style={styles.searchInput}
          />

          {/* <SearchBar
          value={this.state.keyword}
          placeholder={`搜索(最多${WORDS_MAX_LENGTH}字符)`}
          onSubmit={this.handleSearch}
          onChange={this.handleChange}
          maxLength={WORDS_MAX_LENGTH}
          // style={styles.searchInput}
          // showCancelButton
          /> */}

        </View>
        <View style={styles.iconContainer}>
          <ButtonCommon type={BUTTON_TYPE_SEARCH} onPress={this.handleSearch} />
        </View>
      </View>
    );
  }
}


export default compose(
  // withApollo,
  withMutLocalSearchStatus(),
)(SearchInput);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    // marginHorizontal: 20,
    marginLeft: 2,
    marginRight: 10,
  },
  inputContainer: {
    flex: 3,
    justifyContent: 'center',
  },
  iconContainer: {
    // flex: 0,
    justifyContent: 'center',
  },
  searchInput: {
    // borderBottomColor: '#ffffff',
    // borderBottomWidth: 1,
    // marginTop: 20,
  }
});

