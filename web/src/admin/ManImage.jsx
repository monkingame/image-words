import React, { Component } from 'react';
import { Table, Button, Row, Switch, Modal } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";
import gql from "graphql-tag";

import ManWords from './ManWords';
import './Admin.css';
import ImageSts from '../components/ImageSts';

import { PAGE_SIZE } from './AdminConst';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { MUT_DEL_IMAGE, } from '../graphql/GQLMutation';
import { isoDate2LocaleString } from '../util/CommonUtil';
import ManUser from './ManUser';

// @2018-06-29 15:20:18
class ManImage extends Component {

  // @2018-06-29 15:16:54
  // TODO: 要把userToken 全部换成operToken
  constructor(props) {
    super(props);
    this.state = {
      // 说说文字管理
      visibleModalWords: false,
      imageid: null,
      // 单个用户管理
      visibleModalUser: false,
      userid: null,
      // 图像预览
      visibleModalImagePreview: false,
    };
  }


  renderPagination = () => {
    const { imagesCount, fetchMore } = this.props;

    return {
      total: imagesCount,
      pageSize: PAGE_SIZE,
      onChange: (page, size) => {
        // getUserList(adminid, (page - 1) * PAGE_SIZE, PAGE_SIZE);
        fetchMore({
          variables: {
            offset: (page - 1) * PAGE_SIZE,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            const more = fetchMoreResult.moreImages;
            if (!more || more.length <= 0) {
              return prev;
            }
            return Object.assign({}, prev, {
              moreImages: [...more]
            });
          },
        });
      }
    };

  }


  handleCancelWords = () => {
    this.setState({ visibleModalWords: false, });
  }

  onClickWords = (e, imageid) => {
    this.setState({ visibleModalWords: true, });
    this.setState({ imageid });
  }

  // @2018-06-29 15:17:31
  onClickUser = (e, userid) => {
    this.setState({ visibleModalUser: true, });
    this.setState({ userid });
  }

  // @2018-06-29 15:17:35
  handleCancelUser = () => {
    this.setState({ visibleModalUser: false, });
  }

  // @2018-07-01 17:50:57
  onClickImagePreview = (e, imageid) => {
    this.setState({ visibleModalImagePreview: true, });
    this.setState({ imageid });
  }

  handleCancelImagePreview = () => {
    this.setState({ visibleModalImagePreview: false, });
  }


  render() {
    const { imagesCount, moreImages, operToken } = this.props;
    if (!imagesCount || imagesCount <= 0 ||
      !moreImages || moreImages.length <= 0 ||
      !operToken) return null;
    // console.log('ManImage : ', imagesCount, moreImages);

    return (
      <div>
        <div>
          <label>看图说说信息管理(总数：{imagesCount})</label>
        </div>
        <div>
          <Table
            columns={this.genColumns()}
            // dataSource={this.genDataFromImageList(imagelist)}
            dataSource={moreImages.map(
              (image) => ({
                ...image,
                key: image.id,
                createdAt: isoDate2LocaleString(image.createdAt),
              })
            )}
            pagination={this.renderPagination()}
          />
        </div>

        <div>
          <Modal
            // title="说说文字列表"
            visible={this.state.visibleModalWords}
            width='80%'
            onCancel={this.handleCancelWords}
            footer={[
              <Button key="back" onClick={this.handleCancelWords}>{"关闭"}</Button>,
            ]}
          >
            <ManWords
              userToken={operToken}
              imageid={this.state.imageid} />
          </Modal>
        </div>

        <div>
          <Modal
            title="相关作者信息"
            visible={this.state.visibleModalUser}
            width='80%'
            onCancel={this.handleCancelUser}
            footer={[
              <Button key="back" onClick={this.handleCancelUser}>{"关闭"}</Button>,
            ]}
          >
            <ManUser
              operToken={this.props.operToken}
              userid={this.state.userid} />
          </Modal>
        </div>

        <div>
          <Modal
            title="图像预览"
            visible={this.state.visibleModalImagePreview}
            width='80%'
            onCancel={this.handleCancelImagePreview}
            footer={[
              <Button key="back" onClick={this.handleCancelImagePreview}>{"关闭"}</Button>,
            ]}
          >
            <ImageSts
              customStyle={"admin-img-zoom"}
              id={this.state.imageid}
              userToken={this.props.operToken} />
          </Modal>
        </div>
      </div>
    );
  }

  genColumns = () => [
    {
      title: '文件名',
      dataIndex: 'filename',
      render: (text, record, index) => {
        return (<div>
          <Row>{text}</Row>
          <Row>
            <Button onClick={(e) => this.onClickWords(e, record.key)}>
              说说列表
            </Button>
          </Row>
        </div>);
      },
    }, {
      title: '赞',
      dataIndex: 'vote',
    }, {
      title: '作者',
      dataIndex: 'authorid',
      render: (text, record, index) => {
        const { adminid, } = this.props;
        if (adminid === record.authorid) return (<div>{'自己'}</div>);

        return (<div>
          <div>{record.authorid}</div>
          <div><Button onClick={(e) => this.onClickUser(e, record.authorid)}>
            用户信息
          </Button></div>
        </div>);
      }
    }, {
      title: '创建时间',
      dataIndex: 'createdAt',
    }, {
      title: '预览',
      dataIndex: 'preview',
      render: (text, record, index) => {
        return (<div onClick={(e) => this.onClickImagePreview(e, record.id)}>
          {/* <ImageSignatureUrl filename={record.filename} /> */}
          {/* @2018-06-30 16:39:46
          TODO: 此处token:只有admin才会取回所有包括删除的数据 */}
          <ImageSts id={record.id}
            customStyle={"admin-img-preview"}
            userToken={this.props.operToken} />
        </div>);
      }
    }, {
      title: '删除',
      dataIndex: 'deleted',
      render: (text, record, index) => {
        return (
          <span>
            <Switch checked={record.deleted}
              onChange={async (checked) => {
                const { delImage, operToken } = this.props;
                // const del = await delImage({
                await delImage({
                  variables: {
                    userToken: operToken,
                    id: record.id,
                    deleted: checked,
                  }
                });
                // console.log('ManImage delete: ', del);
              }}
            />
          </span>
        )
      },
    },
  ];

}


export default compose(
  graphql(gql`
    query ImagesCount($userToken: String!) {
      imagesCount(userToken: $userToken)
    }`, {
      name: `imagesCount`,
      props: ({ imagesCount: { imagesCount, error, loading } }) => ({ imagesCount, error, loading }),
      options: ({ operToken }) => ({ variables: { userToken: operToken } }),
    }),

  graphql(QUERY_MORE_IMAGES, {
    name: `moreImages`,
    props: ({ moreImages: { moreImages, error, loading, fetchMore } }) =>
      ({ moreImages, error, loading, fetchMore }),
    options: ({ operToken }) => ({ variables: { offset: 0, limit: PAGE_SIZE, userToken: operToken } }),
  }),

  graphql(MUT_DEL_IMAGE, { name: `delImage`, }),
)(ManImage);

