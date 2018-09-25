import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, Button, Alert, } from 'react-native';
import { compose, } from 'react-apollo';

// import { BUTTON_TYPE_MORE, BUTTON_TYPE_SHARE } from '../components/button/ButtonConst';
// import { WEB_SERVER_URL, } from '../util/ApiServer';
import { withMetadataQuery } from '../graphql/WithQuery';
import { inDebugMode } from '../util/SystemUtil';
// import { stringifyImageSize, parseImageSizeString } from '../util/ImageUtil';

class About extends Component {

  render() {
    const { metadata, } = this.props;
    if (!metadata) {
      return null;
    }

    // console.log('About metadata: ', metadata);

    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <Text>{`看图说说-v${metadata.version}`}</Text>
        </View>

        <View style={styles.eula}>
          <Text style={{ marginBottom: 10 }}>最终用户许可协议</Text>
          <ScrollView>
            {/* <Text>{this.state.eula}</Text> */}
            <Text>{metadata.eula}</Text>
          </ScrollView>
        </View>

        <View style={styles.copyright}>
          <Text>版权所有@2018</Text>
          <Text>kantushuoshuo.com</Text>
          <Text>作者:sun</Text>
          <Text>feedback@kantushuoshuo.com</Text>
        </View>

        {/* <ButtonCommon type={BUTTON_TYPE_MORE} onPress={this.showDialog} text='关于' /> */}

        {
          inDebugMode() ?
            (
              <View style={{ flex: 3 }}>
                <Button
                  onPress={() => {
                    Alert.alert('您正处于调试模式，\n请联系管理员或作者');
                  }}
                  title="您正处于调试模式"
                  color="#841584"
                  accessibilityLabel="点击获取更多关于此按钮的信息"
                />
              </View>
            ) :
            null
        }

      </View>
    );
  }
}


// export default AboutContainer;
export default compose(
  withMetadataQuery(),
)(About);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eula: {
    flex: 8,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3FAFD',
    borderColor: '#1122AA',
    // borderWidth: 1,
  },
  copyright: {
    flex: 4,
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    // backgroundColor: 'red',
  }
});
