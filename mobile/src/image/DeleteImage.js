import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, Button, StyleSheet, Alert } from 'react-native';
import { compose, graphql } from "react-apollo";

// import { deleteImage } from './actions';
// import { isImageOwnCurrentUser } from '../main/Util';
import ButtonCommon from '../components/button/ButtonCommon';
import { BUTTON_TYPE_DELETE } from '../components/button/ButtonConst';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { withImageQuery, } from '../graphql/WithQuery';
import { MUT_DEL_IMAGE, } from '../graphql/GQLMutation';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { QUERY_LOCAL_PAGINATION_IMAGES, MUT_ADD_LOCAL_PAGINATION_IMAGES, } from '../graphql/GQLLocal';


class DeleteImage extends Component {

  doDelete = () => {
    Alert.alert(
      '删除看图说说',
      '确认删除吗？不可恢复',
      [
        { text: '取消', onPress: this.handleCancel, style: 'cancel' },
        { text: '删除', onPress: this.handleDelete },
      ],
      // { cancelable: false }
    );
  }

  handleDelete = async () => {
    // const { deleteId, _id } = this.props;
    // deleteId(_id);

    const { loginedUser, image, delImage, id } = this.props;
    if (!loginedUser || !image) return;
    await delImage({
      variables: {
        id,
        userToken: loginedUser.token,
      }
    });
  }

  handleCancel = () => {
  }

  render() {
    // const { isMine } = this.props;
    // if (!isMine) return null;

    const { loginedUser, image } = this.props;
    if (!loginedUser || !image) return null;
    if (loginedUser.id !== image.authorid) return null;

    return (
      // <View style={styles.container}>
      <ButtonCommon
        type={BUTTON_TYPE_DELETE}
        onPress={this.doDelete}
        color={'red'}
      />
      // </View>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//   return {
//     isMine: isImageOwnCurrentUser(state, ownProps._id)
//   };
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     deleteId: (_id) => {
//       dispatch(deleteImage(_id));
//     }
//   }
// }

// const DeleteImageContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(DeleteImage);

// export default DeleteImageContainer;
export default compose(
  // withApollo,
  withImageQuery(),
  withLocalLoginedUserQuery(),
  graphql(MUT_DEL_IMAGE, {
    name: `delImage`,
    options: {
      update: (proxy, { data: { delImage } }) => {
        // console.log('DeleteImage MUT_DEL_IMAGE: ', proxy, delImage);

        // 
        // const data = proxy.readQuery({ query: QUERY_MORE_IMAGES });
        // const index = data.moreImages.findIndex((ele) => (ele.id === delImage.id));
        // data.moreImages.splice(index, 1);
        // proxy.writeQuery({ query: QUERY_MORE_IMAGES, data });

        // @2018-07-26 17:15:44
        const data = proxy.readQuery({ query: QUERY_LOCAL_PAGINATION_IMAGES });
        const index = data.paginationImages.findIndex((ele) => (ele.id === delImage.id));
        data.paginationImages.splice(index, 1);
        proxy.writeQuery({ query: QUERY_LOCAL_PAGINATION_IMAGES, data });
      },
    },
  }),
)(DeleteImage);




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
