
import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as TypeConst from './ButtonConst';
import { FONT_SIZE } from './ButtonConst';

//type:按钮类型，取值为string
//status:对于双向状态按钮 表示两个状态，比如vote，取值为true/false
export const RenderIcon = ({ type, status, color, size = FONT_SIZE }) => {
  if (!type) return null;

  switch (type) {
    case TypeConst.BUTTON_TYPE_NONE:
      return null;
    // 增加
    case TypeConst.BUTTON_TYPE_ADD:
      return <SimpleLineIcons size={size} name="plus" color={color} />;

    case TypeConst.BUTTON_TYPE_DELETE:
      return <FontAwesome size={size} name="trash-o" color={color} />;

    // 更多
    case TypeConst.BUTTON_TYPE_MORE:
      return <Entypo
        size={size}
        name={status ? "chevron-with-circle-up" : "chevron-with-circle-down"}
        color={color} />;

    // 更多 横向的
    case TypeConst.BUTTON_TYPE_MORE_HORIZON:
      return <Entypo
        size={size}
        name={status ? "chevron-with-circle-left" : "chevron-with-circle-right"}
        color={color} />;

    // 刷新
    case TypeConst.BUTTON_TYPE_REFRESH:
      return <MaterialIcons size={size} name="refresh" color={color} />;

    // 共享
    case TypeConst.BUTTON_TYPE_SHARE:
      return <MaterialIcons size={size} name="share" color={color} />;

    // 投票
    case TypeConst.BUTTON_TYPE_VOTE:
      return <FontAwesome size={size} name={status ? "thumbs-up" : "thumbs-o-up"} color={color} />;

    case TypeConst.BUTTON_TYPE_CLOSE:
      return <SimpleLineIcons size={size} name="close" color={color} />;
    case TypeConst.BUTTON_TYPE_SEARCH:
      return <SimpleLineIcons size={size} name="magnifier" color={color} />;
    case TypeConst.BUTTON_TYPE_TROPHY:
      return <SimpleLineIcons size={size} name="trophy" color={color} />;
    case TypeConst.BUTTON_TYPE_BLOCK:
      return <MaterialIcons size={size} name="block" color={color} />;
    case TypeConst.BUTTON_TYPE_REPORT:
      return <Octicons size={size} name="report" color={color} />;

    // 举报
    case TypeConst.BUTTON_TYPE_WORDS:
      return <FontAwesome size={size} name="commenting-o" color={color} />;

    // login
    case TypeConst.BUTTON_TYPE_LOGIN:
      return <Ionicons size={size} name="md-log-in" color={color} />;

    // logout
    case TypeConst.BUTTON_TYPE_LOGOUT:
      return <Ionicons size={size} name="md-log-out" color={color} />;

    // Register
    case TypeConst.BUTTON_TYPE_REGISTER:
      return <Feather size={size} name="user-plus" color={color} />;

    // edit
    case TypeConst.BUTTON_TYPE_EDIT:
      return <Feather size={size} name="edit" color={color} />;

    // clear
    case TypeConst.BUTTON_TYPE_CLEAR:
      return <Feather size={size} name="delete" color={color} />;

    // favorite
    case TypeConst.BUTTON_TYPE_FAVORITE:
      return <MaterialIcons size={size} name={status ? "favorite" : "favorite-border"} color={color} />;

    // user
    case TypeConst.BUTTON_TYPE_USER:
      return <FontAwesome size={size} name={status ? "user" : "user-o"} color={color} />;

    // eye
    case TypeConst.BUTTON_TYPE_EYE:
      return <SimpleLineIcons size={size} name="eye" color={color} />;

    // 手机 短信
    case TypeConst.BUTTON_TYPE_PHONE_MSG:
      return <MaterialCommunityIcons size={size} name="cellphone-message" color={color} />;

    // check
    case TypeConst.BUTTON_TYPE_CHECK:
      return <SimpleLineIcons size={size} name="check" color={color} />;
  }

  return null;
}
