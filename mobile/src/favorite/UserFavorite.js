import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { compose, } from "react-apollo";
import { StyleSheet, View, Text, } from 'react-native';

import { withMetadataQuery, } from '../graphql/WithQuery';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
// import { BUTTON_TYPE_USER, } from '../components/button';
// import { ButtonCommon } from '../components/button';
// import { ExtDialog, } from '../components';

import { SimpleUserCtrl } from '../user';
import { HEIGHT_TOP_CTRL_BAR, HEIGHT_CHILD, } from '../util/DimesionUtil';
import ListFavorites from './ListFavorites';

class UserFavorite extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // renderNoFavoriteTitle = () => {
  //   const { metadata, loginedUser } = this.props;
  //   if (!metadata || !loginedUser || !this.props.moreFavorites) {
  //     return (
  //       <View style={styles.container}>
  //         <Text style={{ color: 'red' }}>请登录后再收藏</Text>
  //       </View>
  //     );
  //   }

  //   const { moreFavorites } = this.props.moreFavorites;
  //   if (!moreFavorites || (moreFavorites.length <= 0)) return (
  //     <View style={styles.container}>
  //       <Text style={{ color: 'blue' }}>未发现收藏列表</Text>
  //     </View>
  //   );

  //   return (
  //     <View style={styles.container}>
  //       <Text style={{ color: 'blue' }}>我的收藏列表</Text>
  //     </View>
  //   );
  // }

  render() {
    const { metadata, loginedUser, } = this.props;
    // console.log('UserFavorite render: ', metadata, loginedUser);
    const logined = metadata && loginedUser;

    // if (!metadata || !loginedUser) return (
    //   <View style={styles.container}>
    //     <Text style={{ color: 'red' }}>请登录后再收藏</Text>
    //   </View>
    // );

    // if (!this.props.moreFavorites) return this.renderNoFavoriteTitle();
    // const { moreFavorites } = this.props.moreFavorites;
    // if (!moreFavorites || (moreFavorites.length <= 0)) return this.renderNoFavoriteTitle();
    // console.log('ListFavorites moreFavorites: ', moreFavorites);

    return (
      <View style={styles.container}>
        <View style={styles.user}>
          <SimpleUserCtrl longTitle={true} />
        </View>

        <View style={styles.main}>
          {
            logined ?
              <ListFavorites
                metadata={metadata}
                loginedUser={loginedUser}
              /> :
              <Text style={{ color: 'red' }}>请登录后再收藏</Text>
          }

        </View>
      </View>
    );
  }
}



export default compose(
  withMetadataQuery(),
  withLocalLoginedUserQuery(),
)(UserFavorite);


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: HEIGHT_CHILD + HEIGHT_TOP_CTRL_BAR,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
  user: {
    // flex: 1,
    height: 40,
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'green',
    // borderRadius: 6,
  },
});

