import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, Button, StyleSheet } from 'react-native';
import IconLine from 'react-native-vector-icons/SimpleLineIcons';
import { compose, } from "react-apollo";

import { withImageQuery, } from '../graphql/WithQuery';

class ImageVoteCount extends Component {
  render() {
    const { image } = this.props;
    if (!image) return null;

    return (
      <View style={styles.container}>
        <IconLine size={15} name="trophy"
          // color={'gray'}
        />
        <Text>{image.vote}</Text>
      </View>
    );
  }
}


export default compose(
  withImageQuery(),
)(ImageVoteCount);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

