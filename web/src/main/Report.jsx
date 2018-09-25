import React, { Component } from 'react';
import { Button, Radio, Input } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";

import './main.css';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { MUT_ADD_REPORT, } from '../graphql/GQLMutation';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';

const RadioGroup = Radio.Group;


class Report extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: -1,
      customReport: null,
    };
  }

  onSelectChange = (e) => {
    // console.log('Report onSelectChange: ', e.target.value);
    const { value } = e.target;
    this.setState({
      selected: value,
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { selected, customReport } = this.state;
    if (selected < 0) return;
    if (selected === 4) {
      if (!customReport || customReport.length <= 0) return;
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

  onCustomReportChange = (e) => {
    const { value } = e.target;
    this.setState({ customReport: value });
    // console.log(this.state.customReport);
  }

  render() {
    const { loginedUser, } = this.props;
    if (!loginedUser) return null;
    const { counterStr, ticking, } = this.props.timeoutCounter;

    return (
      <div className="report-wrap">
        <form onSubmit={this.handleSubmit}>
          <div>
            <RadioGroup onChange={this.onSelectChange} value={this.state.selected}>
              <Radio style={radioStyle} value={0}>{reportType[0]}</Radio>
              <Radio style={radioStyle} value={1}>{reportType[1]}</Radio>
              <Radio style={radioStyle} value={2}>{reportType[2]}</Radio>
              <Radio style={radioStyle} value={3}>{reportType[3]}</Radio>
              {/* 选项4是自定义用户输入 */}
              <Radio style={radioStyle} value={4}>{reportType[4]}</Radio>
            </RadioGroup>
            <br />
            <Input style={{ width: 200, marginLeft: 10 }}
              placeholder="其他行为"
              maxLength={WORDS_MAX_LENGTH}
              onChange={this.onCustomReportChange}
              disabled={this.state.selected !== 4}
            />
          </div>

          <br />
          <Button htmlType="submit"
            disabled={this.state.selected < 0 ||
              (this.state.selected === 4 && (!this.state.customReport || this.state.customReport.length <= 0)) ||
              ticking}
          >
            {`举报${counterStr}`}
          </Button>
        </form>

      </div>
    );
  }
}


const reportType = ['违反法律',//0
  '垃圾广告',
  '侵权行为',
  '恶意行为',
  '其他行为',//4
];

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

export default compose(
  // withApollo,
  withLocalLoginedUserQuery(),

  graphql(MUT_ADD_REPORT, { name: `addReport`, }),

)(withTimeoutCounter(Report, 10));

