import React, { Component } from 'react';
import { compose } from "react-apollo";
import { Form, Button, Icon } from 'antd';
import 'antd/dist/antd.css';
import { withImageQuery, } from '../graphql/WithQuery';


// TODO:后期加入定制导出功能
class ExportImageButton extends Component {

  handleSubmit = (e) => {
    const { image } = this.props;
    if (!image) return null;
    e.preventDefault();

    const { download, } = this.props;
    download(image.selectedWord + ".jpg");
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Button htmlType="submit" >
            <Icon type="download" />
            {"保存"}
          </Button>
        </Form>
      </div>
    );
  }
}


export default compose(
  withImageQuery(),
)(ExportImageButton);
