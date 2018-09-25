
import React, { Component } from 'react';
import { compose, graphql, withApollo, } from "react-apollo";
import { StyleSheet, View, Text, Platform, PermissionsAndroid, } from 'react-native';
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

import { withLocalLoginedUserQuery, withImageQuery, } from '../graphql/WithQuery';
import { ImageFromServerUrl, } from '../components';
import { SelectedWordsLabelStyle as StyleLabel } from '../components';
// import { QUERY_IMAGE, } from '../graphql/GQLQuery';
import { QUEREY_FAVORITE, } from '../graphql/GQLQuery';
import { MUT_SWITCH_FAVORITE, } from '../graphql/GQLMutation';
import ButtonCommon from '../components/button/ButtonCommon';
import {
  BUTTON_TYPE_MORE, BUTTON_TYPE_SHARE, BUTTON_TYPE_FAVORITE, BUTTON_TYPE_EYE,
} from '../components/button/ButtonConst';
import { withMutImageLocalField } from '../graphql/WithMutation';
import { addJpegBase64Header } from '../util/BufferBase64';
import { getAndroidPermission } from '../util/PermissionUtil';

// import { HEIGHT_TOP_CTRL_BAR, HEIGHT_CHILD, } from '../util/DimesionUtil';
import StyleFavorite,
{
  WIDTH_FAVORITE_ITEM, HEIGHT_FAVORITE_ITEM,
  SCALE_WIDTH_IMAGE, HEIGHT_FAVORITE_WORD,
} from './ListFavoritesStyle';
// import FavoriteImageWord from './FavoriteImageWord';

// TODO: query image 类
// 注意：ossToken是通过读取metadata获取的stsToken，用来从服务器返回signed url。
// 仅在react-native有用，因为rn无法正确使用ali-oss API
// 此FavoriteImageWordContainer的作用就是，通过metadata，query Image，获取signed url，
// 当这些数据齐全之后，就可以被image无障碍使用了

// 这里设计的有点绕，并不是一个合理的方案，很容易不注意导致出现错误：
// Error: unsupported URL
// 其实原因就是在于：
// ImageFromServerUrl pullImageFromServer函数中，
// const res = await RNFetchBlob.fetch('GET', signedUrl);
// 如果不先通过metadata query image，那么此处的signedUrl就是null。
// 自然出现unsupported URL错误。
// NOTE: 这个类和ImageWordsNew非常相似，只是少了很多控制功能。

// TODO: 取代FavoriteImageWord

class FavoriteItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // getAndroidPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const allowedStorage =
  //       await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  //       );
  //     return allowedStorage === PermissionsAndroid.RESULTS.GRANTED;
  //   }
  //   return true;
  // }

  getViewShotBase64 = async () => {
    const uri = await this.refs.viewShot.capture();
    const puredata = await RNFS.readFile(uri, 'base64');
    const base64 = addJpegBase64Header(puredata);
    const { updateImageLocalBase64Copying, imageid, } = this.props;
    updateImageLocalBase64Copying({
      variables: {
        id: imageid,
        base64Copying: base64,
      }
    });
    return base64;
  }

  rnShareViewShotImage = async () => {
    const { image } = this.props;
    if (!image) return;
    // const { selectedWord } = image;
    const base64 = await this.getViewShotBase64();
    const shareFile = {
      url: base64,
    };
    Share.open(shareFile);
  }

  onShareImageWithWords = async () => {
    // if (!this.getAndroidPermission()) return;
    if (!getAndroidPermission()) return;
    await this.rnShareViewShotImage();
  }

  switchFavoriteStatus = async (favorited) => {
    const { loginedUser, switchFavorite, imageid, favoriteContent, } = this.props;
    if (!loginedUser || !switchFavorite || !favoriteContent) {
      // this.setState({ visibleModalLogin: true, titleLoginDialog: '请先登录再收藏', });
      return;
    }

    // this.setState({ titleLoginDialog: null, });
    await switchFavorite({
      variables: {
        userToken: loginedUser.token,
        imageid,
        favorited,
        word: favoriteContent.word,
      }
    });
  }

  render() {
    const { metadata, favoriteContent, favorite, loginedUser, } = this.props;
    if (!metadata || !favoriteContent) return null;
    // console.log('FavoriteItem render: ', image);

    const { imageid, word } = favoriteContent;
    // console.log('FavoriteItem render: ', favorite);

    return (
      <View style={StyleFavorite.itemFavorite}>
        <View style={StyleFavorite.imageWithWord}>
          <ViewShot
            style={styles.viewShot}
            ref="viewShot"
            options={{
              format: "jpg",
            }}>
            <View style={StyleFavorite.imageFavorite}>
              <ImageFromServerUrl
                id={imageid}
                metadata={metadata}
                maxSize={{
                  width: WIDTH_FAVORITE_ITEM * SCALE_WIDTH_IMAGE,
                  height: HEIGHT_FAVORITE_ITEM - HEIGHT_FAVORITE_WORD,
                }}
              />
              <Text style={StyleLabel.label}>{word}</Text>
            </View>
          </ViewShot>
        </View>

        <View style={StyleFavorite.ctrlFavorite}>
          <ButtonCommon type={BUTTON_TYPE_SHARE}
            onPress={this.onShareImageWithWords} />
          <ButtonCommon type={BUTTON_TYPE_FAVORITE}
            color={loginedUser ?
              (favorite ? 'red' : 'black') :
              'gray'}
            status={favorite}
            onPress={() => this.switchFavoriteStatus(!favorite)} />
          {/* <ButtonCommon type={BUTTON_TYPE_EYE} onPress={() => { }} /> */}
        </View>
      </View>
    );
  }
}


export default compose(
  // withApollo,
  withImageQuery(),
  withMutImageLocalField('base64Copying'),

  graphql(QUEREY_FAVORITE, {
    name: `favorite`,
    props: ({ favorite: { favorite, } }) => ({ favorite, }),
    options: ({ loginedUser, imageid }) =>
      ({
        variables: {
          // $userToken: String! 因此未登录时 参数为'' 而不是null
          userToken: loginedUser ? loginedUser.token : '',
          imageid,
        }
      }),
  }),

  graphql(MUT_SWITCH_FAVORITE, {
    name: `switchFavorite`,
    options: (props) => ({
      update: (proxy, { data: { switchFavorite } }) => {
        const { loginedUser, imageid } = props;
        const data = proxy.readQuery({
          query: QUEREY_FAVORITE,
          variables: {
            userToken: loginedUser ? loginedUser.token : '',
            imageid,
          }
        });
        data.favorite = switchFavorite;
        proxy.writeQuery({
          query: QUEREY_FAVORITE,
          data,
          variables: {
            userToken: loginedUser ? loginedUser.token : '',
            imageid,
          }
        });
      },
    }),
  }),



)(FavoriteItem);


// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     // height: HEIGHT_CHILD + HEIGHT_TOP_CTRL_BAR,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // borderWidth: 1,
//     // borderColor: 'blue',
//     // borderRadius: 6,
//   },
// });

