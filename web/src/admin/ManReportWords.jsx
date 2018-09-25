import React, { Component } from 'react';
import { compose, graphql, } from "react-apollo";
import gql from "graphql-tag";
import { Table, Switch, Button, Modal, } from 'antd';
import 'antd/dist/antd.css';

import { PAGE_SIZE } from './AdminConst';
import { isoDate2LocaleString } from '../util/CommonUtil';
// import ImageSts from '../components/ImageSts';
import './Admin.css';
import { ReportType, } from './AdminFragment';
import { withMutDelReport, withMutProcessReport, } from './AdminConst';
import ManUser from './ManUser';

class ManReportWords extends Component {

  // @2018-06-29 11:19:51
  constructor(props) {
    super(props);
    this.state = {
      // 单个用户管理
      visibleModalUser: false,
      userid: null,
    };
  }

  onClickUser = (e, userid) => {
    this.setState({ visibleModalUser: true, });
    this.setState({ userid });
  }

  handleCancelUser = () => {
    this.setState({ visibleModalUser: false, });
  }


  render() {
    const { reportsCount, moreReports, operToken, } = this.props;
    // console.log('ManReportWords props: ', reportsCount, moreReports, operToken, imageid);

    if (!reportsCount || reportsCount <= 0 ||
      !moreReports || moreReports.length <= 0 ||
      !operToken) return null;
    // console.log('ManReportWords moreReports: ', moreReports, );

    return (
      <div>
        <div>
          <label>举报说说管理(总数：{reportsCount})</label>
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

  genColumns = () => [{
    title: 'ID',
    dataIndex: 'id',
  }, {
    title: '举报理由',
    dataIndex: 'contents',
    // render: (text, record, index) => {
    //   const { contents } = record;
    //   // console.log('ManReportWords genColumns: ', contents);
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
    title: '对应说说',
    dataIndex: 'word',
    render: (text, record, index) => {
      return (<span>
        {record.word ? record.word.content : null}
      </span>);
    },
  },
  {
    title: '说说上传者',
    dataIndex: 'wordsAuthor',
    render: (text, record, index) => {
      const { author } = record.word;
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
        {record.word ?
          <Switch checked={record.word.deleted}
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
          /> :
          null}
      </span>);
    },
  },

  {
    title: '举报时间',
    dataIndex: 'updatedAt',
  }];

}


export default compose(
  // withApollo,
  // withLocalLoginedUserQuery(),

  graphql(gql`
    query ReportsCount($operToken: String!,$imageid:ID) {
      reportsCount(operToken: $operToken,imageid:$imageid)
    }`, {
      name: `reportsCount`,
      props: ({ reportsCount: { reportsCount, error, loading } }) => ({ reportsCount, error, loading }),
      options: ({ operToken, imageid }) => ({ variables: { operToken, imageid } }),
    }),

  graphql(gql`
    query MoreReports($operToken: String!, $offset: Int!, $limit: Int!,$imageid:ID) {
      moreReports(operToken: $operToken, offset: $offset, limit: $limit,imageid:$imageid) {
        ...ReportTypeDetails
      }
    }
    ${ReportType.fragments.details}`, {
      name: `moreReports`,
      props: ({ moreReports: { moreReports, error, loading, fetchMore } }) =>
        ({ moreReports, error, loading, fetchMore }),
      options: ({ operToken, imageid }) => ({ variables: { operToken, offset: 0, limit: PAGE_SIZE, imageid } }),
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

)(ManReportWords);


