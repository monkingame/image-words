import React, { Component } from 'react';
// import { Button, Radio, Input } from 'antd';
// import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";
import { Text, View, TextInput, StyleSheet, Alert, } from 'react-native';

// import './main.css';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { MUT_ADD_REPORT, } from '../graphql/GQLMutation';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';

// const RadioGroup = Radio.Group;
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import ButtonCommon from '../components/button/ButtonCommon';
import { BUTTON_TYPE_REPORT, } from '../components/button/ButtonConst';

class Report extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: -1,
      customReport: null,
    };
  }

  onSelectChange = (index, value) => {
    // console.log('Report onSelectChange: ', e.target.value);
    // const { value } = e.target;
    // this.setState({
    //   selected: value,
    // });
    this.setState({
      selected: index,
    });
  }

  handleSubmit = async () => {
    // e.preventDefault();

    const { selected, customReport } = this.state;
    if (selected < 0) {
      Alert.alert("请选择举报内容");
      return;
    }

    if (selected === 4) {
      if (!customReport || customReport.length <= 0) {
        Alert.alert("请输入具体的其他行为");
        return;
      };
    }

    const content = selected === 4 ?
      customReport.substring(0, WORDS_MAX_LENGTH) :
      reportType[selected];

    const { addReport, loginedUser, imageid, wordid, afterReport, } = this.props;
    if (!loginedUser) return;

    const { startCounter, waitInfinite } = this.props.timeoutCounter;
    waitInfinite();
    const result = await addReport({
      variables: {
        userToken: loginedUser.token,
        content,
        imageid,
        wordid,
      }
    });
    // console.log('Report handleSubmit: ', result);
    if (result) {
      this.setState({ selected: -1 });
      startCounter();
      afterReport();
    }
  }

  onCustomReportChange = (customReport) => {
    // const { value } = e.target;
    this.setState({ customReport });
    // console.log(this.state.customReport);
  }

  render() {
    const { loginedUser, } = this.props;
    if (!loginedUser) return null;
    const { counterStr, ticking, } = this.props.timeoutCounter;

    return (
      <View style={styles.container}>
        <Text>{"举报"}</Text>

        {/* 选项4是自定义用户输入 */}
        {/* <RadioGroup onChange={this.onSelectChange} value={this.state.selected}>
          <Radio style={radioStyle} value={0}>{reportType[0]}</Radio>
          <Radio style={radioStyle} value={1}>{reportType[1]}</Radio>
          <Radio style={radioStyle} value={2}>{reportType[2]}</Radio>
          <Radio style={radioStyle} value={3}>{reportType[3]}</Radio>
          <Radio style={radioStyle} value={4}>{reportType[4]}</Radio>
        </RadioGroup> */}

        < RadioGroup style={styles.groupContainer}
          onSelect={(index, value) => this.onSelectChange(index, value)}>
          <RadioButton value={0} >
            <Text>{reportType[0]}</Text>
          </RadioButton>

          <RadioButton value={1}>
            <Text>{reportType[1]}</Text>
          </RadioButton>

          <RadioButton value={2}>
            <Text>{reportType[2]}</Text>
          </RadioButton>

          <RadioButton value={3}>
            <Text>{reportType[3]}</Text>
          </RadioButton>

          <RadioButton value={4}>
            <Text>{reportType[4]}</Text>
          </RadioButton>
        </RadioGroup >

        {/* <Input style={{ width: 200, marginLeft: 10 }}
          placeholder="其他行为"
          maxLength={WORDS_MAX_LENGTH}
          onChange={this.onCustomReportChange}
          disabled={this.state.selected !== 4}
        /> */}
        <View style={styles.textCustomContainer}>
          < TextInput
            // value={this.state.username}
            placeholder='其他行为'
            maxLength={WORDS_MAX_LENGTH}
            autoCapitalize='none'
            onChangeText={this.onCustomReportChange}
            // style={styles.input}
            editable={this.state.selected === 4}
          />
        </View>

        {/* <Button htmlType="submit"
          disabled={this.state.selected < 0 ||
            (this.state.selected === 4 && (!this.state.customReport || this.state.customReport.length <= 0)) ||
            ticking}
        >
          {`举报${counterStr}`}
        </Button> */}
        <View style={styles.textButtonSubmitContainer}>
          <ButtonCommon
            type={BUTTON_TYPE_REPORT}
            // @2018-06-26 21:07:39 改进举报提示（如果选择了其他行为，必须输入行为内容）
            // disabled={
            //   this.state.selected < 0 ||
            //   (this.state.selected === 4 && (!this.state.customReport || this.state.customReport.length <= 0)) ||
            //   ticking
            // }
            disabled={ticking}
            text={`点此举报${counterStr}`}
            onPress={this.handleSubmit}
          />
        </View>

      </View >
    );
  }
}


const reportType = ['违反法律',//0
  '垃圾广告',
  '侵权行为',
  '恶意行为',
  '其他行为',//4
];

// const radioStyle = {
//   display: 'block',
//   height: '30px',
//   lineHeight: '30px',
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#F5FCFF',
    marginTop: 10,
    marginLeft: 100,
  },
  groupContainer: {
    flex: 3,
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#F5FCFF',
  },
  textCustomContainer: {
    flex: 1,
    marginTop: 20,
    width: 200,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  textButtonSubmitContainer: {
    flex: 1,
    marginTop: 20,
    width: 200,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});


export default compose(
  // withApollo,
  withLocalLoginedUserQuery(),

  graphql(MUT_ADD_REPORT, { name: `addReport`, }),

)(withTimeoutCounter(Report, 10));

