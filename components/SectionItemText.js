import React, {
  Component,
} from 'react'
import {
  Text,
} from 'react-native'


class SectionItemText extends Component {

  shouldComponentUpdate(nextProps) {
    const [curStyle, nextStyle] = [this.props.style, nextProps.style];
    if (curStyle.width !== nextStyle.width
      || curStyle.textAlign !== nextStyle.textAlign
      || curStyle.fontSize !== nextStyle.fontSize) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <Text
        {...this.props}
      >
        { this.props.children }
      </Text>
    );
  }
}

export default SectionItemText
