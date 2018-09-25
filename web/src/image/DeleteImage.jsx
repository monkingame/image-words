import React, { Component } from 'react';
import { Button, Modal, Icon } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql } from "react-apollo";

import './Vote.css';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { withImageQuery, } from '../graphql/WithQuery';
import { MUT_DEL_IMAGE, } from '../graphql/GQLMutation';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';

class DeleteImage extends Component {

  state = { visible: false };

  showModal = () => {
    this.setState({ visible: true, });
  }

  handleConfirmDelete = async () => {
    const { loginedUser, image, delImage, id } = this.props;
    if (!loginedUser || !image) return;
    await delImage({
      variables: {
        id,
        userToken: loginedUser.token,
      }
    });
    // const deleted = result.data.delImage;
    // console.log('DeleteImage confirm delete: ', deleted);
    //NOTE:注意 此时不能再setState了 详见最下面注释
    // this.setState({ visible: false, });
  }

  handleCancel = (e) => {
    this.setState({ visible: false, });
  }


  render() {
    const { loginedUser, image } = this.props;
    if (!loginedUser || !image) return null;
    // console.log('DeleteImage : ', image);
    // const { author } = image;
    // if (!author) return null;

    if (loginedUser.id !== image.authorid) return null;

    return (
      <div>
        {/* <form onSubmit={this.handleSubmit}> */}
        <Button type="danger" icon="delete" onClick={() => { this.setState({ visible: true }) }} >
          {"删除"}
        </Button>
        {/* </form> */}

        <Modal
          title="确认删除吗？"
          visible={this.state.visible}
          onOk={this.handleConfirmDelete}
          // onCancel={this.handleCancel}
          onCancel={() => { this.setState({ visible: false }) }}
        >
          <p><Icon type="exclamation-circle" style={{ fontSize: 36 }} />{"删除不可回复"}</p>
        </Modal>
      </div >
    );
  }
}

export default compose(
  // withApollo,
  withImageQuery(),
  withLocalLoginedUserQuery(),
  graphql(MUT_DEL_IMAGE, {
    name: `delImage`,
    options: {
      update: (proxy, { data: { delImage } }) => {
        // const data = proxy.readQuery({ query: QUERY_LIST_IMAGES });
        // const index = data.images.findIndex((ele) => (ele.id === delImage.id));
        // data.images.splice(index, 1);
        // proxy.writeQuery({ query: QUERY_LIST_IMAGES, data });

        //NOTE:注意：
        //执行完writeQuery后， QUERY_LIST_IMAGES cache数据已经改变
        //而在ListItem中的Datasource数据也随之改变，
        //整个ImageWords（仅限此image ID对应的单个ImageWords）组件立刻消失
        //附在下面的所有子组件也会消失
        //而此DeleteImage就是附着于ImageWords的，也会消失
        //因此在handleConfirmDelete执行完await delImage后，所有针对此组件的state操作都会无效
        //因此会出现setState警告
        //Warning: Can't call setState (or forceUpdate) on an unmounted component.

        // console.log('DeleteImage MUT_DEL_IMAGE: ', proxy, delImage);
        const data = proxy.readQuery({ query: QUERY_MORE_IMAGES });
        const index = data.moreImages.findIndex((ele) => (ele.id === delImage.id));
        data.moreImages.splice(index, 1);
        proxy.writeQuery({ query: QUERY_MORE_IMAGES, data });
      },
    },
  }),
)(DeleteImage);

