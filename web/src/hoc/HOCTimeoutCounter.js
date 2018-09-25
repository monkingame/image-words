import React, { Component } from 'react';
import { DISABLE_INPUT_INTERVAL } from '../util/GlobalConst';

// This function takes a component...
export default function withTimeoutCounter(WrappedComponent, timeout = DISABLE_INPUT_INTERVAL) {
  return class extends Component {

    //TODO:timeout 超时时间，默认为DISABLE_INPUT_INTERVAL，单位是秒
    //NOTE:经过测试 setTimeout比setInterval要精确的多。setInterval可能会非常慢
    constructor(props) {
      super(props);
      this.timer = null;
      this.state = { counter: 0, timeout };
      this.mouted = false;
    }

    componentDidMount() {
      this.mouted = true;
    }

    componentWillUnmount() {
      if (this.mouted) {
        this.stopCounter();
      }
    }

    startCounter = (counter = this.state.timeout) => {
      // console.log('withTimeoutCounter startCounter: ', counter);

      this.stopCounter();
      // this.setState({ counter: this.state.timeout });
      this.setState({ counter }, () => {
        this.timer = setTimeout(this.tick, 1 * 1000);
      });
      // this.timer = setInterval(this.tick, timeout * 1000);
      // this.timer = setTimeout(this.tick, 1 * 1000);
    }

    tick = () => {
      // console.log('withTimeoutCounter tick : ', this.state.counter);

      const { counter } = this.state;
      if (counter <= 0) {
        // clearInterval(this.timer);
        // clearTimeout(this.timer);
        this.stopCounter();
        // return;
      } else {
        this.setState({ counter: counter - 1 });
        this.timer = setTimeout(this.tick, 1 * 1000);
      }

      // this.setState({ counter: counter - 1 }, () => {
      //   if (counter <= 0) {
      //     clearInterval(this.timer);
      //   }
      // });

      // this.setState({ counter: counter - 1 });
    }

    stopCounter = () => {
      // clearInterval(this.timer);
      this.setState({ counter: 0 });
      clearTimeout(this.timer);
    }

    setCounterToInfinite = () => {
      this.setState({ counter: 0xFFFFFFFF });
    }

    render() {
      // return <WrappedComponent
      //   timeoutCounter={this.state.counter}
      //   // timeoutDuration={this.state.timeout}
      //   isTimerRunning={this.state.counter > 0}
      //   startTimeoutCounter={this.startCounter}
      //   stopTimeoutCounter={this.stopCounter}
      //   waitForInfinite={this.setCounterToInfinite}
      //   {...this.props}
      // />;

      return <WrappedComponent
        timeoutCounter={{
          counter: this.state.counter,
          counterStr: this.state.counter > 0 ? `${this.state.counter}` : '',
          ticking: this.state.counter > 0,
          startCounter: this.startCounter,
          stopCounter: this.stopCounter,
          waitInfinite: this.setCounterToInfinite,
        }}
        {...this.props}
      />;
    }
  };
}

