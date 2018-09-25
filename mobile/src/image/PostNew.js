import React, { Component } from 'react';
import { Text, View, ActivityIndicator, Button, Platform, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { compose, graphql } from "react-apollo";
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';

// import { MEGA_NUMBER, MAX_IMAGE_SIZE_INMEGA } from './ConstFile';
import PhotoUploader from '../components/PhotoUploader';
import { ICON_PLUS } from '../components/Base64IconFile';
import { getDimensionWidth, getDimensionHeight } from '../util/DimesionUtil';
import ButtonCommon from '../components/button/ButtonCommon';
import { BUTTON_TYPE_CLEAR } from '../components/button/ButtonConst';

import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { MUT_ADD_IMAGE, } from '../graphql/GQLMutation';
import { genMd5Name, getDecode, getFilenameNoExt, } from '../util/BufferBase64';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { QUERY_LOCAL_PAGINATION_IMAGES, MUT_ADD_LOCAL_PAGINATION_IMAGES, } from '../graphql/GQLLocal';
import withFormChecker from '../hoc/HOCFormChecker';


const MEGA_NUMBER = 1024 * 1024;
const MAX_IMAGE_SIZE_INMEGA = 5;

class PostNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 文件信息，包括size filename等
      fileinfo: null,
      // 图像base64编码
      base64: '',
      // 说说文字
      content: '',
      // 正在保存标志
      saving: false,
      prompt: '请点击上面的 + 按钮选择图片',
    };
  }

  clearAllData = () => {
    this.setState({ base64: '', content: '', fileinfo: null });
    this.props.formChecker.clearErrorMsg();
  }

  clearInputText = () => {
    this.setState({ content: '', });
  }

  checkInputData = () => {
    const { fileinfo, base64, content } = this.state;
    const { loginedUser, } = this.props;
    const { setErrorMsg, clearErrorMsg, } = this.props.formChecker;

    if (!loginedUser) {
      // Alert.alert(`请先登录`);
      setErrorMsg('请先登录');
      return false;
    }
    if (!base64 || !fileinfo) {
      // Alert.alert("请选择图片");
      setErrorMsg('请选择图片');
      return false;
    }
    if (fileinfo.size <= 0) {
      // Alert.alert(`不允许空文件`);
      setErrorMsg('不允许空文件');
      return false;
    }
    if (!content || content.length <= 0) {
      // Alert.alert("请输入说说文字");
      setErrorMsg('请输入说说文字');
      return false;
    }

    // @2018-06-22 15:25:44
    // 很奇怪，在ios下面，获取文件尺寸总是实际尺寸的3倍左右，只能暂时取一个2倍值
    // TODO: NOTE: 原因未明
    const maxFileSize = (Platform.OS === 'android') ?
      (MAX_IMAGE_SIZE_INMEGA * MEGA_NUMBER) :
      (MAX_IMAGE_SIZE_INMEGA * MEGA_NUMBER * 2);

    // if (fileinfo.size >= MAX_IMAGE_SIZE_INMEGA * MEGA_NUMBER) {
    if (fileinfo.size >= maxFileSize) {
      // Alert.alert(`文件尺寸不能大于${MAX_IMAGE_SIZE_INMEGA}M`);
      setErrorMsg(`文件尺寸不能大于${MAX_IMAGE_SIZE_INMEGA}M`);
      return false;
    }

    if (content.length > WORDS_MAX_LENGTH) {
      // Alert.alert(`说说长度不能超过${WORDS_MAX_LENGTH}字符`);
      setErrorMsg(`说说长度不能超过${WORDS_MAX_LENGTH}字符`);
      return false;
    }

    clearErrorMsg();
    return true;
  }


  //response结构：
  // {data:'base64....xxxxxxx.............',
  // fileName:"IMG_20180118_123842.jpg",
  // fileSize:28275,
  // height:480,
  // isVertical:true,
  // originalRotation:0,
  // @2018-06-22 14:30:36 path不再存在了
  // path:"/storage/emulated/0/DCIM/Camera/IMG_20180118_123842.jpg",
  // timestamp:"2018-01-18T12:38:42Z",
  // type:"image/jpeg",
  // uri:"content://com.google.android.apps.photos.contentprovider/-1/1/content%3A%2F%2Fmedia%2Fexternal%2Ffile%2F53/ORIGINAL/NONE/981106067",
  // width:480}
  // 图片选择触发事件
  onResponse = async (response) => {
    this.props.formChecker.clearErrorMsg();

    if (!response || !response.data) return;
    this.setState({ prompt: '可以点击上面的图片再次选择' });

    const { fileName, fileSize, width, height, type, timestamp, } = response;
    // console.log('PostNew onResponse response: ', response);

    this.setState({
      fileinfo: {
        name: fileName,
        size: fileSize,
        width, height,
        type, timestamp,
      }
    });
    // console.log('PostNew onResponse fileName: ', fileName);
    // TODO:关闭自动填充 防止用户随意提交
    // this.autoSetContent(fileName);

    const base64 = `data:${response.type};base64,${response.data}`;
    this.setState({ base64, });
  }

  // 自动设置文件名到输入框 ， 12字符长度要注意
  autoSetContent = (filename) => {
    const nameNoExt = getFilenameNoExt(filename);
    if (!nameNoExt || this.state.content) return;
    this.setState({ content: nameNoExt.substring(0, WORDS_MAX_LENGTH) });
  }


  calImageRect = () => {
    //"添加"图标的尺寸为51*51
    // const width = (getDimensionWidth() - 60) || 51;
    const { fileinfo } = this.state;
    const width = getDimensionWidth();
    const height = getDimensionHeight();
    // console.log('PostNew width: ', width);
    let imgWidth = 51;
    let imgHeight = 51;
    if (fileinfo) {
      imgWidth = width - 60 - 40;
      imgHeight = height / 2;
    }
    // console.log('calImageRect: ', imgWidth, imgHeight);

    return { imgWidth, imgHeight };
  }


  handlePostNew = async () => {
    if (!this.checkInputData()) return;

    const { fileinfo, base64, content } = this.state;
    const { loginedUser, addImage, closeModal } = this.props;

    const newImageData = {
      userToken: loginedUser.token,
      filename: genMd5Name(fileinfo.name, base64),
      base64,
      content,
    };
    // console.log('handlePostNew newImageData: ', newImageData);

    this.setState({ saving: true });
    const mut = await addImage({ variables: { newImageData } });
    this.setState({ saving: false });
    // console.log('Post new image finished: ', result);
    const result = mut.data.addImage;
    // console.log('PostNew image finished: ', result);
    // if (result) {
    closeModal(result);
    // }
  }

  render() {
    const { imgWidth, imgHeight } = this.calImageRect();
    const containerWidth = (getDimensionWidth() - 60) || 51;

    return (
      <TouchableOpacity
        style={{ flex: 1, }}
        activeOpacity={1}
        onPressOut={() => {/* 空函数，防止外层的透明背景点击到此，触发关闭Dialog事件*/ }}
      >
        <View style={[styles.container, { width: containerWidth, }]}>
          {/* <View style={{ flex: 1, }}> */}
          <View>
            <Text>{"新的看图说说"}</Text>
            <Text style={{ color: 'red' }}>
              {this.props.formChecker.errmsg}
            </Text>
          </View>

          <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center', }}>
            <PhotoUploader
              // onPhotoSelect={this.onPhotoSelect}
              onResponse={this.onResponse}>
              <Image
                style={{
                  // paddingVertical: 30,
                  width: imgWidth,
                  height: imgHeight,
                  // borderRadius: 5,
                }}
                source={{
                  uri: ICON_PLUS,
                }}
                resizeMode={'contain'}
              />
            </PhotoUploader>
          </View>
          <Text>{this.state.prompt}</Text>

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ flex: 6, }}>
              <TextInput
                style={{ width: containerWidth - 40, }}
                onChangeText={(content) => {
                  this.props.formChecker.clearErrorMsg();
                  this.setState({ content });
                }}
                value={this.state.content}
                placeholder={`配句说说(最多${WORDS_MAX_LENGTH}字符)`}
                autoCapitalize='none'
                maxLength={WORDS_MAX_LENGTH}
              />
            </View>
            <View style={{ flex: 1, }}>
              <ButtonCommon type={BUTTON_TYPE_CLEAR} onPress={this.clearInputText} />
            </View>
          </View>

          <View style={{ flex: 1, }}>
            {
              this.state.saving ?
                <ActivityIndicator size="large" color="#0000ff" /> :
                <Button
                  onPress={this.handlePostNew}
                  title="发表看图说说"
                />
            }
          </View>

        </View>
      </TouchableOpacity>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});



export default compose(
  withLocalLoginedUserQuery(),
  graphql(MUT_ADD_IMAGE, {
    name: `addImage`,
    options: {
      update: (proxy, { data: { addImage } }) => {
        if (!addImage) return;

        // @2018-07-26 16:55:21
        // const data = proxy.readQuery({ query: QUERY_MORE_IMAGES });
        // data.moreImages.unshift(addImage);//or push item to the end
        // proxy.writeQuery({ query: QUERY_MORE_IMAGES, data });

        // @2018-07-26 17:15:39
        const data = proxy.readQuery({ query: QUERY_LOCAL_PAGINATION_IMAGES });
        data.paginationImages.unshift(addImage);//or push item to the end
        proxy.writeQuery({ query: QUERY_LOCAL_PAGINATION_IMAGES, data });
      },
    }
  }),
  // )(PostNew);
)(withFormChecker(PostNew));


