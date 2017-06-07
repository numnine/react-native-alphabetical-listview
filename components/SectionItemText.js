import React, {
  Component,
} from 'react'
import {
  Text,
} from 'react-native'


class SectionItemText extends Component {

  shouldComponentUpdate(nextProps) {
    if (this.props.style.fontSize !== nextProps.style.fontSize) {
        console.log('UPDATE: ', nextProps.children)
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
