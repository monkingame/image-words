import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Table, Switch, } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";
import gql from "graphql-tag";

import './Admin.css';

import { PAGE_SIZE } from './AdminConst';
import { QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { isoDate2LocaleString } from '../util/CommonUtil';
import { MUT_DEL_WORD, } from '../graphql/GQLMutation';

class ManWords extends Component {

  renderPagination = () => {
    const { wordsCountByImageId, fetchMore } = this.props;
    return {
      total: wordsCountByImageId,
      pageSize: PAGE_SIZE,
      onChange: (page, size) => {
        // getUserList(adminid, (page - 1) * PAGE_SIZE, PAGE_SIZE);
        fetchMore({
          variables: {
            offset: (page - 1) * PAGE_SIZE,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            const more = fetchMoreResult.moreWordsByImageId;
            if (!more || more.length <= 0) {
              return prev;
            }
            return Object.assign({}, prev, {
              moreWordsByImageId: [...more]
            });
          },
        });
      },
    };

  }

  render() {
    const { wordsCountByImageId, moreWordsByImageId, userToken, } = this.props;
    if (!wordsCountByImageId || wordsCountByImageId <= 0 || !moreWordsByImageId || moreWordsByImageId.length <= 0 || !userToken) return null;
    // console.log('ManWords : ', imageid, wordsCountByImageId, moreWordsByImageId);

    return (
      <div>
        <div>
          <label>说说信息管理(总数：{wordsCountByImageId})</label>
        </div>
        <div>
          <Table
            columns={this.genColumns()}
            // dataSource={this.genDataFromUserList(wordslist)}
            dataSource={moreWordsByImageId.map(
              (word) => ({
                ...word,
                key: word.id,
                createdAt: isoDate2LocaleString(word.createdAt),
              })
            )}
            pagination={this.renderPagination()}
          />
        </div>
      </div>
    );
  }

  genColumns = () => [{
    title: '说说',
    dataIndex: 'content',
  }, {
    title: '赞',
    dataIndex: 'vote',
  }, {
    title: '创建用户',
    dataIndex: 'authorid',
  }, {
    title: '创建时间',
    dataIndex: 'createdAt',
  }, {
    title: '删除',
    dataIndex: 'deleted',
    render: (text, record, index) => {
      return (
        <span>
          <Switch checked={record.deleted}
            onChange={async (checked) => {
              const { delWord, userToken } = this.props;
              await delWord({
                variables: {
                  userToken,
                  id: record.id,
                  deleted: checked,
                }
              });
            }}
          />
        </span>
      )
    },
  },];

}


export default compose(
  graphql(gql`
    query WordsCountByImageId($userToken: String!, $imageid: ID!) {
      wordsCountByImageId(userToken: $userToken, imageid: $imageid)
    }`, {
      name: `wordsCountByImageId`,
      props: ({ wordsCountByImageId: { wordsCountByImageId, error, loading } }) => ({ wordsCountByImageId, error, loading }),
      options: ({ userToken, imageid }) => ({ variables: { userToken, imageid } }),
    }),

  graphql(QUERY_MORE_WORDS_BY_IMAGEID, {
    name: `moreWordsByImageId`,
    props: ({ moreWordsByImageId: { moreWordsByImageId, error, loading, fetchMore } }) =>
      ({ moreWordsByImageId, error, loading, fetchMore }),
    options: ({ userToken, imageid }) => ({ variables: { offset: 0, limit: PAGE_SIZE, userToken, imageid } }),
  }),

  graphql(MUT_DEL_WORD, { name: `delWord`, }),

)(ManWords);

