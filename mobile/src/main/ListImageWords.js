import React, { Component, PureComponent } from 'react';
import { View, FlatList, StyleSheet, Text, } from 'react-native';
import { graphql, compose, withApollo, } from "react-apollo";

// 新版的ImageWordsNew @2018-07-24 09:22:18
import ImageWords from './ImageWords';
import { HEIGHT_BOTTOM_TAB_BAR } from '../util/DimesionUtil';
// import { BackToTop } from '../components';
import { withMetadataQuery, withLocalPaginationImagesQuery, } from '../graphql/WithQuery';
// import { refreshNewMoreImages } from './Util';
import { getDimensionWidth, getDimensionHeight } from '../util/DimesionUtil';
import { getInputOssTokenByMetadata } from '../graphql/GQLTypes';

// 游标分页模式
import { QUERY_NEXT_IMAGE, QUERY_IMAGE, } from '../graphql/GQLQuery';
import { QUERY_LOCAL_PAGINATION_IMAGES, MUT_ADD_LOCAL_PAGINATION_IMAGES, } from '../graphql/GQLLocal';
import { MUT_LOCAL_PAGINATION_CURSOR, QUERY_LOCAL_PAGINATION_CURSOR, } from '../graphql/GQLLocal';

// 尺寸
import { HEIGHT_CHILD, HEIGHT_TOP_CTRL_BAR, MARGIN_CHILD, WIDTH_CHILD, } from '../util/DimesionUtil';

const _ = require('lodash');

// viewAreaCoveragePercentThreshold @2018-07-24 09:22:09
const VIEW_COVERAGE_PERCENT = 50;
// onEndReachedThreshold @2018-07-24 09:22:11
const END_REACH_THRESHOLD = 50 / 100;

// @2018-07-22 08:36:10
// 新版List
class ListImageWords extends Component {

  constructor(props) {
    super(props);

    // ref to flatlist @2018-07-24 09:22:23
    this.refFlatlist = null;

    // viewabilityConfig @2018-07-24 09:22:25
    this.viewabilityConfig = {
      waitForInteraction: true,
      viewAreaCoveragePercentThreshold: VIEW_COVERAGE_PERCENT,
    };
    // onViewableItemsChanged @2018-07-24 09:22:28
    // 视口改变，记录当前可见ChildItem
    this.onViewableItemsChanged = ({ viewableItems, changed }) => {
      if (viewableItems && viewableItems.length > 0) {
        const len = viewableItems.length;
        this.setState({ currentViewable: viewableItems[len - 1] });
      }
    };

    // 是否要触发拖到底动作（需要获取更多数据了） @2018-07-24 09:22:31
    this.willTriggerEnd = false;

    this.state = {
      hasMore: true,
      refreshing: false,
      //当前视图 @2018-07-24 09:22:35
      currentViewable: null,
    };
  }

  renderItem = ({ item }) => {
    const { metadata } = this.props;
    return (
      <ImageWords id={item.id} metadata={metadata} />
    );
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    const oldGqlImage = prevProps.nextImage;
    const newGqlImage = this.props.nextImage;
    if (oldGqlImage && newGqlImage) {
      const oldImage = oldGqlImage.nextImage;
      const newImage = newGqlImage.nextImage;
      if (oldImage !== newImage) {
        // console.log('componentDidUpdate: ', newImage);
        await this.updateCurrentImage(newImage);

        // // 缓存数据
        // await this.cacheImageQuery(newImage);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // paginationImages
    const oldPagiImages = this.props.paginationImages.paginationImages;
    const newPagiImages = nextProps.paginationImages.paginationImages;
    // 说明还未查询到数据 持续更新
    if (!oldPagiImages || !newPagiImages) return true;
    // 说明此时还没有数据，应该允许刷新，否则 componentDidUpdate 便无法更新
    if (newPagiImages.length === 0) return true;

    // const update = (oldPagiImages === newPagiImages);
    const update = _.isEqual(oldPagiImages, newPagiImages);
    // console.log('shouldComponentUpdate : ', newPagiImages);
    return !update;
    // return true;
  }


  updateCurrentImage = async (image) => {
    if (!image) return;

    // 增加image到列表
    await this.addPaginationImage(image);

    // 缓存数据
    await this.cacheImageQuery(image);

    // 改写游标
    await this.mutPaginationCursor(image);
  }

  // 更新游标 参数为图像数据
  mutPaginationCursor = async (image) => {
    if (!image) return;
    const { updateLocalPaginationCursor } = this.props;
    // const data = 
    await updateLocalPaginationCursor({
      variables: {
        cursor: image.createdAt,
      }
    });
    // console.log('About updateLocalListImagesCursor: ', data);
  }

  // 增加图像到分页缓存
  addPaginationImage = async (image) => {
    if (!image) return;
    const { addLocalPaginationImages, } = this.props;
    await addLocalPaginationImages({
      variables: {
        image,
      }
    });
  }

  // 将图像更新到QUERY_IMAGE缓存，便于下次查询
  cacheImageQuery = async (image) => {
    if (!image) return;
    const { client } = this.props;
    await client.writeQuery({
      query: QUERY_IMAGE,
      data: { image },
      variables: { id: image.id }
    });
    // console.log('About writeImage2QueryCache: ', image);
  }


  // 从服务器获取下一个数据：注意此函数并不返回数据，只是在改写当前游标
  // 如果下一个游标在缓存中存在，即直接返回；否则从服务器读取
  // 参数direction取值： after/before
  fetchNextImage = async (direction) => {
    const { metadata, nextImage, } = this.props;
    const cursor = await this.queryLocalPaginationCursor();
    const found = await this.findCursorInCachePagiImages(cursor, direction);
    // TODO: 按理说 游标不该从这里改写的 ???
    // console.log('fetchNextImage find in cache: ', direction, found);
    if (found) {
      // 改写游标??? 不该改写
      await this.mutPaginationCursor(found);
      return;
    }

    const { fetchMore } = nextImage;
    // console.log('fetchNextImage fetchMore: ', this.props);

    fetchMore({
      variables: {
        cursor,
        direction,
        ossToken: getInputOssTokenByMetadata(metadata),
        operToken: null,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        // console.log('fetchNextImage updateQuery fetchMoreResult: ', direction, fetchMoreResult);

        if (!fetchMoreResult) return prev;
        const more = fetchMoreResult.nextImage;
        if (!more) {
          return prev;
        }
        // this.cacheImageQuery(more);
        // TODO: 按理说，应该在这里改写游标，但无必要。
        // 因为 componentWillReceiveProps 里面对nextImage进行了处理，保证收到新数据即修改游标。
        // componentWillReceiveProps 里的 nextImage 就是这里的 nextImage .
        // TODO: @2018-07-25 10:08:59 可是现在已经取消了 componentWillReceiveProps
        // 是否应该改写游标？
        // TODO: 改写游标 componentDidUpdate 应该也承担了
        // const image = more.nextImage;
        // console.log('fetchNextImage updateQuery more: ', direction, more);
        this.addPaginationImage(more);

        return { nextImage: more };
      },
    });

  }

  // 在分页图像列表里面查询下一个游标（即取出当前图像相邻的下一个图像）
  // direction: before/after
  findCursorInCachePagiImages = async (cursor, direction) => {
    const cacheImages = await this.queryLocalPaginationImages();
    if (!cacheImages || cacheImages.length === 0) return null;
    const index = cacheImages.findIndex((ele) => (ele.createdAt === cursor));
    if (index < 0) return null;
    if ((index === 0) && (direction === 'after')) return null;
    // console.log('findCursorInCachePagiImages : ', index, direction, cacheImages.length);
    if ((index === (cacheImages.length - 1)) && (direction === 'before')) return null;

    if (direction === 'after') {
      return cacheImages[index - 1];
    }
    if (direction === 'before') {
      return cacheImages[index + 1];
    }
    return null;
  }

  // 查询当前游标
  queryLocalPaginationCursor = async () => {
    const { client } = this.props;
    const { data } = await client.query({
      query: QUERY_LOCAL_PAGINATION_CURSOR,
    });
    if (!data) return null;
    const { paginationCursor } = data;
    // console.log('About queryLocalPaginationCursor paginationCursor: ', paginationCursor);
    return paginationCursor;
  }

  // 查询当前所有分页数据（图像数组）
  queryLocalPaginationImages = async () => {
    const { client } = this.props;
    const { data } = await client.query({
      query: QUERY_LOCAL_PAGINATION_IMAGES,
    });
    if (!data) return null;
    const { paginationImages } = data;
    // console.log('About queryLocalListImages paginationImages: ', paginationImages);
    return paginationImages;
  }


  // onBackToTop = async () => {
  //   this.refs.listImageWordsRef.scrollToOffset({ x: 0, y: 0, });
  // }

  // TODO:需要增加几个常量：HEIGHT_CHILD等 @2018-07-24 09:22:39
  getItemLayout = (data, index) => {
    const layout = {
      length: HEIGHT_CHILD,
      offset: HEIGHT_CHILD * index,
      index,
    };
    return layout;
  }

  // 拖拽到结尾了 @2018-07-24 09:22:42
  onEndReached = async (info) => {
    if (!this.onEndReachedCalledDuringMomentum) {
      this.onEndReachedCalledDuringMomentum = true;
      // TODO:此处应该添加新数据到尾部
      // await this.appendNewData();

      // console.log('onEndReached will occur.');
      await this.fetchNextImage('before');
    }
  }

  // 下拉刷新 @2018-07-24 09:22:44
  onRefresh = async () => {
    this.setState({ refreshing: true });
    // TODO:插入新数据到开头
    // await this.insertNewData();
    await this.fetchNextImage('after');

    this.setState({ refreshing: false });
  }

  // 拖完后，惯性运动开始 @2018-07-24 09:22:48
  onMomentumScrollBegin = () => {
    this.onEndReachedCalledDuringMomentum = false;
  }

  // 惯性运动结束 @2018-07-24 09:22:50
  onMomentumScrollEnd = () => {
    // 自动惯性拖动到当前ViewItem
    // TODO: @2018-08-01 17:31:42 改为惯性结束后自动对齐
    this.autoInertiaAlignIndex();
  }

  // 开始拖动 @2018-07-24 09:22:54
  onScrollBeginDrag = () => {
    this.inDragScroll = true;
  }

  // 结束拖动 @2018-07-24 09:22:57
  onScrollEndDrag = async () => {
    this.inDragScroll = false;

    // TODO: @2018-08-01 17:31:17 改为惯性结束后自动对齐
    // // 自动惯性拖动到当前ViewItem
    // this.autoInertiaAlignIndex();

    if (this.willTriggerEnd) {
      // TODO:已经拖到结尾，在末尾追加数据
      // 实际上，这个动作把拖动后的惯性运动给屏蔽了（onMomentumScrollBegin/End）
      // await this.appendNewData();
      await this.fetchNextImage('before');
    } else {
      // 拖动未到结尾 可以不做处理
    }
  }

  // 惯性运动FlatList到当前ViewItem @2018-07-24 09:23:00
  autoInertiaAlignIndex = () => {
    const { currentViewable } = this.state;
    if (currentViewable) {
      const { index, item, isViewable } = currentViewable;
      if (isViewable && this.refFlatlist) {
        this.refFlatlist.scrollToIndex({
          animated: true,
          index,
          viewOffset: 0,
          viewPosition: 0,
        });
      }
    }
  }

  // 滚动时触发，计算是否拖动到了结尾，如果距离底部还要两个ChildItem，就开始触发获取新数据
  // @2018-07-24 09:23:02
  onScroll = ({ nativeEvent }) => {
    if (nativeEvent) {
      const { contentInset, contentOffset, contentSize,
        layoutMeasurement, zoomScale } = nativeEvent;
      const { y } = contentOffset;
      const { height } = contentSize;
      const distanceToBottom = height - y;
      const { length } = this.getItemLayout(null, 0);//length是单个child content的高度
      //子元素高度大于距离底部距离即表示要到结尾了， *2表示
      // const gotBottom = (length * 2) >= distanceToBottom;
      this.willTriggerEnd = (length * 2) >= distanceToBottom;
    }
  }


  render() {
    const { metadata, } = this.props;
    if (!metadata) return null;

    const { paginationImages } = this.props;
    if (paginationImages) {
      const data = paginationImages.paginationImages;
      if (!data) return null;
    } else {
      return null;
    }

    return (
      <View style={styles.container}>

        <FlatList
          ref={r => { this.refFlatlist = r; }}
          data={paginationImages.paginationImages}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => item.id}
          getItemLayout={this.getItemLayout}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={END_REACH_THRESHOLD}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onRefresh={this.onRefresh}
          refreshing={this.state.refreshing}
          onScrollBeginDrag={this.onScrollBeginDrag}
          onScrollEndDrag={this.onScrollEndDrag}
          onScroll={this.onScroll}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={this.viewabilityConfig}
        />

        {/* 返回顶部按钮 */}
        {/* <View style={styles.backToTop}>
          <BackToTop onPress={this.onBackToTop} />
        </View> */}

      </View>
    );
  }
}



export default compose(
  withApollo,

  // withMetadataQuery(),

  // 查询当前缓存的图像分页数据（游标模式）
  withLocalPaginationImagesQuery(),

  // 游标分页
  graphql(QUERY_NEXT_IMAGE, {
    name: `nextImage`,
    options: ({ metadata }) => ({
      variables: {
        cursor: (new Date()),
        direction: 'before',
        ossToken: getInputOssTokenByMetadata(metadata),
        operToken: null,
      }
    }),
  }),

  // 更新本地游标
  graphql(MUT_LOCAL_PAGINATION_CURSOR, { name: `updateLocalPaginationCursor`, }),
  // 添加获取到的图像到本地翻页数据
  graphql(MUT_ADD_LOCAL_PAGINATION_IMAGES, { name: `addLocalPaginationImages`, }),

)(ListImageWords);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderColor: 'red',
    // borderWidth: 2,
    // width: WIDTH_CHILD,
    // height: HEIGHT_CHILD,
  },
  loadMore: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  backToTop: {
    // flex: 1,
    position: 'absolute',
    top: getDimensionHeight() - HEIGHT_BOTTOM_TAB_BAR * 3.5,
    left: getDimensionWidth() - 60,
  }
});

