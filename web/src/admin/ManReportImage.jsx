import React, { Component } from 'react';
import { Table, Switch, Modal, Button, Row, } from 'antd';
import { compose, graphql, } from "react-apollo";
import gql from "graphql-tag";
import 'antd/dist/antd.css';

import { PAGE_SIZE } from './AdminConst';
import { isoDate2LocaleString } from '../util/CommonUtil';
import ImageSts from '../components/ImageSts';
import './Admin.css';
import { ReportType, } from './AdminFragment';
import { withMutDelReport, withMutProcessReport, } from './AdminConst';
import ManReportWords from './ManReportWords';
import ManUser from './ManUser';

class ManReportImage extends Component {

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

  onClickWords = (e, imageid) => {
    this.setState({ visibleModalWords: true, });
    this.setState({ imageid });
  }

  handleCancelWords = () => {
    this.setState({ visibleModalWords: false, });
  }

  // @2018-06-29 09:31:28
  onClickUser = (e, userid) => {
    this.setState({ visibleModalUser: true, });
    this.setState({ userid });
  }

  // @2018-06-29 09:31:34
  handleCancelUser = () => {
    this.setState({ visibleModalUser: false, });
  }

  // @2018-07-01 17:51:10
  onClickImagePreview = (e, imageid) => {
    this.setState({ visibleModalImagePreview: true, });
    this.setState({ imageid });
  }

  handleCancelImagePreview = () => {
    this.setState({ visibleModalImagePreview: false, });
  }

  render() {
    const { reportsCount, moreReports, operToken } = this.props;
    if (!reportsCount || reportsCount <= 0 ||
      !moreReports || moreReports.length <= 0 ||
      !operToken) return null;
    // console.log('ManReportImage moreReports : ', reportsCount, moreReports);

    return (
      <div>
        <div>
          <label>举报图像管理(总数：{reportsCount})</label>
        </div>
        <div>
          <Table
            columns={this.genColumns()}
            dataSource={moreReports.map(
              (report) => ({
                ...report,
                key: report.id,
                updatedAt: isoDate2LocaleString(report.updatedAt),
              })
            )}
            pagination={this.renderPagination()}
          />
        </div>

        <div>
          <Modal
            title="举报说说文字列表"
            visible={this.state.visibleModalWords}
            width='80%'
            onCancel={this.handleCancelWords}
            footer={[
              <Button key="back" onClick={this.handleCancelWords}>{"关闭"}</Button>,
            ]}
          >
            <ManReportWords
              operToken={this.props.operToken}
              imageid={this.state.imageid}
              adminid={this.props.adminid} />
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

  renderPagination = () => {
    const { reportsCount, fetchMore, operToken, } = this.props;
    return {
      total: reportsCount,
      pageSize: PAGE_SIZE,
      onChange: (page, size) => {
        if (!operToken) return null;

        fetchMore({
          variables: {
            offset: (page - 1) * PAGE_SIZE,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            const more = fetchMoreResult.moreReports;
            if (!more || more.length <= 0) {
              return prev;
            }
            return Object.assign({}, prev, {
              moreReports: [...more]
            });
          },
        });
      }
    };
  }

  genColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text, record, index) => {
        return (<div>
          <Row>{text}</Row>
          <Row>
            <Button onClick={(e) => this.onClickWords(e, record.imageid)}>
              说说列表
          </Button>
          </Row>
        </div>);
      },
    }, {
      title: '举报理由',
      dataIndex: 'contents',
      // render: (text, record, index) => {
      //   const { contents } = record;
      //   return (
      //     <span>
      //       {contents.map((item) => (
      //         <ul key={item.id}>
      //           {item.content}
      //         </ul>
      //       ))
      //       }
      //     </span>
      //   )
      // },
    }, {
      title: '已处理',
      dataIndex: 'processed',
      render: (text, record, index) => {
        return (
          <span>
            <Switch checked={record.processed}
              onChange={async (checked) => {
                const { processReport, operToken } = this.props;
                await processReport({
                  variables: {
                    operToken,
                    id: record.id,
                    processed: checked,
                  }
                });
              }}
            />
          </span>
        )
      },
    },
    {
      title: '对应图像',
      dataIndex: 'preview',
      render: (text, record, index) => {
        return (<div onClick={(e) => this.onClickImagePreview(e, record.imageid)}>
          <ImageSts id={record.imageid}
            customStyle={"admin-img-preview"}
            userToken={this.props.operToken} />
        </div>);
      },
    },
    {
      title: '图像上传者',
      dataIndex: 'imageAuthor',
      render: (text, record, index) => {
        const { author } = record.image;
        const { adminid, operToken, } = this.props;
        if (!author) return null;
        if (adminid === author.id) return (<div>{'自己'}</div>);
        return (<div>
          <div>{author.id}</div>
          <div>
            <Button onClick={(e) => this.onClickUser(e, author.id)}>
              {author.username}
            </Button>
          </div>
          <div>
            删除
            <Switch checked={author.deleted}
              onChange={async (checked) => {
                const { delUser, } = this.props;
                await delUser({
                  variables: {
                    operToken,
                    id: author.id,
                    deleted: checked,
                  }
                });
              }}
            />
          </div>
        </div>)
      },
    },
    {
      title: '删除',
      dataIndex: 'deleted',
      render: (text, record, index) => {
        return (<span>
          <Switch checked={record.image.deleted}
            onChange={async (checked) => {
              const { delReport, operToken } = this.props;
              await delReport({
                variables: {
                  operToken,
                  id: record.id,
                  deleted: checked,
                }
              });
            }}
          />
        </span>);
      },
    },
    {
      title: '最后举报时间',
      dataIndex: 'updatedAt',
    }
  ];

}


// export default ManReport;

export default compose(
  // withApollo,
  // withLocalLoginedUserQuery(),

  graphql(gql`
    query ReportsCount($operToken: String!) {
      reportsCount(operToken: $operToken)
    }`, {
      name: `reportsCount`,
      props: ({ reportsCount: { reportsCount, error, loading } }) => ({ reportsCount, error, loading }),
      options: ({ operToken }) => ({ variables: { operToken } }),
    }),

  graphql(gql`
    query MoreReports($operToken: String!, $offset: Int!, $limit: Int!) {
      moreReports(operToken: $operToken, offset: $offset, limit: $limit) {
        ...ReportTypeDetails
      }
    }
    ${ReportType.fragments.details}`, {
      name: `moreReports`,
      props: ({ moreReports: { moreReports, error, loading, fetchMore } }) =>
        ({ moreReports, error, loading, fetchMore }),
      options: ({ operToken }) => ({ variables: { operToken, offset: 0, limit: PAGE_SIZE } }),
    }),

  // graphql(gql`
  //   mutation DelReport($operToken: String!, $id: ID!, $deleted: Boolean!) {
  //     delReport(operToken: $operToken, id: $id, deleted: $deleted) {
  //       ...ReportTypeDetails
  //     }
  //   }
  //   ${ReportType.fragments.details}`, {
  //     name: `delReport`,
  //   }),
  withMutDelReport(),
  withMutProcessReport(),

  graphql(gql`
    mutation DelUser($operToken: String!, $id: ID!, $deleted: Boolean!) {
      delUser(operToken: $operToken, id: $id, deleted: $deleted) {
        id
        username
        deleted
      }
    }`, {
      name: `delUser`,
    }),


)(ManReportImage);

