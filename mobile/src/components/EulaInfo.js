import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, Button, StyleSheet, Modal, TouchableHighlight, ScrollView, } from 'react-native';
// import RNFS from 'react-native-fs';
import { compose, } from 'react-apollo';

import { saveEulaFlag, getEulaFlag } from './Util';
// import { WEB_SERVER_URL, } from '../util/ApiServer';
import { withMetadataQuery } from '../graphql/WithQuery';

class EulaInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      // eula: '',
    };
  }

  async componentDidMount() {
    // const eulaUrl = `${WEB_SERVER_URL}/eula.txt`;
    // console.log('EulaInfo componentDidMount eulaUrl: ', eulaUrl);
    //TODO:注意，如果AsyncStorage出错了，那么每次都会弹出Eula对话框
    const flag = await getEulaFlag();
    if (!flag) {
      this.setState({ visible: true })
      await saveEulaFlag();
    }

  }

  render() {
    const { metadata, } = this.props;
    if (!metadata) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Modal
          animationType={"slide"}
          transparent={true}
          style={styles.dialogContainer}
          visible={this.state.visible}
          onRequestClose={() => { }}
        >
          <View style={styles.dialogContainer}>
            <View style={styles.eulaContainer}>
              <ScrollView>
                <Text style={styles.eulaText} allowFontScaling={true}>
                  {/* {this.state.eula} */}
                  {metadata.eula}
                </Text>
              </ScrollView>
            </View>

            <View style={styles.closeContainer}>
              <TouchableHighlight
                onPress={() => {
                  // console.log(url);
                  this.setState({ visible: false });
                }}
              >
                <View style={styles.closeButtonContainer}>
                  <Text style={styles.buttonText}>好的，我同意</Text>
                </View>
              </TouchableHighlight>
            </View>

          </View>
        </Modal>
      </View>
    );
  }
}


// export default EulaInfo;
export default compose(
  withMetadataQuery(),
)(EulaInfo);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  dialogContainer: {
    backgroundColor: 'white',
    flex: 1,
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 3,
    borderWidth: 1,
    // borderColor: 'red',
  },
  eulaContainer: {
    flex: 6.5,
    // backgroundColor: 'green',
  },
  eulaText: {
    // color: 'white',
    fontSize: 15,
    marginRight: 20,
    marginLeft: 20
  },
  closeContainer: {
    flex: 1,
    // backgroundColor: '#ff000052',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  closeButtonContainer: {
    width: 200,
    height: 40,
    backgroundColor: 'red',
    borderRadius: 2,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

