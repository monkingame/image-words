import gql from "graphql-tag";
import { graphql, } from "react-apollo";

import { ReportType, } from './AdminFragment';

// 分页：每页条目数量
export const PAGE_SIZE = 12;


export const withMutDelReport = () => graphql(gql`
  mutation DelReport($operToken: String!, $id: ID!, $deleted: Boolean!) {
    delReport(operToken: $operToken, id: $id, deleted: $deleted) {
      ...ReportTypeDetails
    }
  }
  ${ReportType.fragments.details}`, {
    name: `delReport`,
  });


export const withMutProcessReport = () => graphql(gql`
  mutation ProcessReport($operToken: String!, $id: ID!, $processed: Boolean!) {
    processReport(operToken: $operToken, id: $id, processed: $processed) {
      ...ReportTypeDetails
    }
  }
  ${ReportType.fragments.details}`, {
    name: `processReport`,
  });


