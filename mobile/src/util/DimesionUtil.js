
import { Dimensions, Platform, } from 'react-native';
// import { StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { TAB_BAR_HEIGHT } from '../components/TabBar';

const getDimensions = () => {
  // console.log(StatusBar.currentHeight);
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

export const getDimensionWidth = () => {
  const dim = getDimensions();
  if (!dim) return 0;
  return dim.width;
}

export const getDimensionHeight = () => {
  const dim = getDimensions();
  if (!dim) return 0;
  if (Platform.OS === 'ios') {
    return dim.height;
  }
  // android要返回dimension减去statusBar
  return dim.height - getStatusBarHeight();
}

// 最上面的系统栏边条高度
// 44 - on iPhoneX
// 20 - on iOS device
// X - on Android platfrom (runtime value)
// will be 0 on Android, because You pass true to skipAndroid
const getTopStatusBarHeight = () => {
  // android系统返回0 （android系统有点奇怪 statusBar返回有值 但Dimensions返回的却不包含statusBar尺寸）
  const height = getStatusBarHeight(true);
  return height;
}

// 最上面的系统栏边条高度
export const HEIGHT_TOP_STATUS_BAR = getTopStatusBarHeight();

// 上面的边条高度（包含刷新、新图说、搜索等系统按钮）
export const HEIGHT_TOP_CTRL_BAR = 40;

// 底部的边条高度（说说、我、关于等按钮的）
export const HEIGHT_BOTTOM_TAB_BAR = TAB_BAR_HEIGHT;

// 
// 
// 关于子内容（FlatList的子控件ImageWords）的尺寸

// ImageWords 边距
export const MARGIN_CHILD = 0;

// ImageWords 坐标：左
export const LEFT_CHILD = 0;
// ImageWords 坐标：上
export const TOP_CHILD = 0;

// ImageWords 宽度
export const WIDTH_CHILD = getDimensionWidth() -
  LEFT_CHILD * 2 - MARGIN_CHILD * 2;
// ImageWords 高度 这个是纯的内容高度 排除了上下各边条
export const HEIGHT_CHILD = getDimensionHeight() -
  TOP_CHILD * 2 - MARGIN_CHILD * 2 -
  HEIGHT_TOP_STATUS_BAR - HEIGHT_TOP_CTRL_BAR - HEIGHT_BOTTOM_TAB_BAR;

// 图像下面文字标签的高度
export const HEIGHT_WORD_LABEL = 26;
