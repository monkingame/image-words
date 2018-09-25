import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { compose, graphql, withApollo, } from "react-apollo";

import { Button, Row, Col, } from 'antd';
import 'antd/dist/antd.css';
import QRCode from 'qrcode.react';

import './About.css';
import { QUERY_NEXT_IMAGE, QUERY_IMAGE, } from '../graphql/GQLQuery';
import { QUERY_LOCAL_PAGINATION_IMAGES, MUT_ADD_LOCAL_PAGINATION_IMAGES, } from '../graphql/GQLLocal';
import { MUT_LOCAL_PAGINATION_CURSOR, QUERY_LOCAL_PAGINATION_CURSOR, } from '../graphql/GQLLocal';

class About extends Component {

  async componentWillReceiveProps(nextProps) {
    const { nextImage } = nextProps;
    if (!nextImage) return;
    const image = nextImage.nextImage;
    if (!image) return;
    console.log('About componentWillReceiveProps: ', image);

    // 改写游标
    await this.mutPaginationCursor(image);

    // 增加image到列表
    await this.addPaginationImage(image);

    // 缓存数据
    await this.cacheImageQuery(image);
  }

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

  fetchNextImage = async (direction) => {
    const { nextImage, } = this.props;
    const cursor = await this.queryLocalPaginationCursor();
    const found = await this.findCursorInCachePagiImages(cursor, direction);
    // console.log('About fetchNextImage found: ', found);
    if (found) {
      // 改写游标
      await this.mutPaginationCursor(found);
      return;
    }

    const { fetchMore } = nextImage;
    // console.log('About fetchNextImage direction: ', direction);

    fetchMore({
      variables: {
        cursor,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const more = fetchMoreResult.nextImage;
        // console.log('About fetchNextImage more: ', more);
        if (!more) {
          return prev;
        }
        // this.cacheImageQuery(more);
        return { nextImage: more };
      },
    });

  }

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

  mutPaginationCursor = async (image) => {
    // console.log('mutPaginationCursor: ', image);

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

  queryImage = async (id) => {
    const { client } = this.props;
    const { data } = await client.query({
      query: QUERY_IMAGE,
      variables: {
        id,
      },
    });
    if (!data) return null;
    const { image } = data;
    // console.log('About queryImage: ', id, image);
    return image;
  }

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

  addPaginationImage = async (image) => {
    if (!image) return;
    const { addLocalPaginationImages, } = this.props;
    await addLocalPaginationImages({
      variables: {
        image,
      }
    });
  }


  // 测试写入
  onTestWrite = async () => {
    // const { nextImage, } = this.props;
    // const image = nextImage.nextImage;
    // if (!image) return;

    // // 改写游标
    // this.mutPaginationCursor(image);

    // // 增加image到列表
    // this.addPaginationImage(image);

    // this.fetchNextImage('before');

    // const str = '2018-07-04T02:19:42.292Z';
    // const aDate = Date.parse(str);
    // console.log('onTestWrite: ', aDate);
  }

  // 测试读取
  onTestRead = async () => {
    // // 证明了在正确的writeQuery后，再query实际上是读取的cache
    // await this.queryImage('5b3c79982f5a0e34bc194d0f');
    // await this.queryImage('5b3c2ebe8fe9f53ad4b5f489');

    const cursor = await this.queryLocalPaginationCursor();
    console.log('About onTestRead cursor:', cursor);
    const pagiImages = await this.queryLocalPaginationImages();
    console.log('About onTestRead pagiImages:', pagiImages);
  }

  render() {
    // const { nextImage } = this.props;
    // if (nextImage) {
    //   const data = nextImage.nextImage;
    //   if (data) {
    //     console.log('About nextImage: ', data);
    //   }
    // }

    const iosLink = `https://itunes.apple.com/cn/app/%E7%9C%8B%E5%9B%BE%E8%AF%B4%E8%AF%B4/id1347551500?mt=8`;

    return (
      <div>
        {/* <div>
          <Row>
            <Col span={4}>
              <Button type="primary" onClick={() => this.onTestWrite()}>
                {'测试写入'}
              </Button>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={() => this.fetchNextImage('before')}>
                {'前旧上'}
              </Button>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={() => this.fetchNextImage('after')}>
                {'后新下'}
              </Button>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={() => this.onTestRead()}>
                {'测试读取'}
              </Button>
            </Col>
          </Row>
        </div> */}

        <Col span={10} offset={2}>
          <Row>
            <label>安卓版本App</label>
          </Row>
          <br />

          <Row>
            <QRCode value={`${window.location.origin}/image-words-app.apk`} />
          </Row>
          <br />

          <Row>
            <a href='/image-words-app.apk'><Button type="primary" icon="download" >点击下载安卓版</Button></a>
          </Row>
        </Col>

        <Col span={10}>
          <Row>
            <label>iOS版本App</label>
          </Row>
          <br />

          <Row>
            <QRCode value={iosLink} />
          </Row>
          <br />

          <Row>
            <a href={iosLink}><Button type="primary" icon="download" >点击打开iOS版</Button></a>
          </Row>
        </Col>

      </div>
    );
  }
}


// export default About;

export default compose(
  withApollo,

  graphql(QUERY_NEXT_IMAGE, {
    name: `nextImage`,
    // props: ({ nextImage: { nextImage, error, loading, fetchMore } }) =>
    //   ({ nextImage: { nextImage, error, loading, fetchMore } }),
    options: () => ({ variables: { cursor: (new Date()), direction: 'before', } }),
  }),

  graphql(MUT_LOCAL_PAGINATION_CURSOR, { name: `updateLocalPaginationCursor`, }),
  graphql(MUT_ADD_LOCAL_PAGINATION_IMAGES, { name: `addLocalPaginationImages`, }),

)(About);


