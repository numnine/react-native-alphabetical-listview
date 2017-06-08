'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';
import ReactNative, {
  StyleSheet,
  View,
  NativeModules,
  Dimensions,
} from 'react-native';
import SectionItemText from './SectionItemText'

const { UIManager } = NativeModules;

const noop = () => {};
const returnTrue = () => true;

let scrollTimeOut = null;

export default class SectionList extends Component {

  constructor(props, context) {
    super(props, context);

    this.onSectionSelect = this.onSectionSelect.bind(this);
    this.resetSection = this.resetSection.bind(this);
    this.detectAndScrollToSection = this.detectAndScrollToSection.bind(this);
    this.lastSelectedIndex = null;

    this.state = {
      sectionItemBaseStyle: {},
      sectionStyles: [],
      sectionBaseStyles: [],
    }
  }

  onSectionSelect(sectionId, fromTouch) {
    this.props.onSectionSelect && this.props.onSectionSelect(sectionId);

    if (!fromTouch) {
      this.lastSelectedIndex = null;
    }
  }

  resetSection() {
    this.lastSelectedIndex = null;
    this.setState({
      sectionStyles: this.state.sectionBaseStyles,
    })
  }

  highLightSection(index, pageX) {
    const sectionStyles = this.state.sectionBaseStyles.slice();
    const wWidth = Dimensions.get('window').width
    const itemWidth = this.state.sectionItemBaseStyle.width;
    let [count, step] = [0, 10];
    let [centerX, radius, angle] = [wWidth - itemWidth, wWidth - pageX, 180]

    radius = radius > wWidth / 2 ? wWidth / 2 : radius
    radius += 40

    while (angle > 90) {
      angle -= step
      const x = centerX + radius * Math.cos(-angle * Math.PI / 180);
      const i1 = index - count;
      const i2 = index + count;

      const newStyle = StyleSheet.flatten([this.state.sectionItemBaseStyle, {
        width: Math.round(wWidth - x),
        textAlign: 'left',
      }]);

      if(count === 0) {
        newStyle['fontSize'] = newStyle.fontSize * 2;
        newStyle['fontWeight'] = 'bold';
      }

      if(sectionStyles[i1]) {
        sectionStyles[i1] = newStyle
      }
      if(i1 !== i2 && sectionStyles[i2]) {
        sectionStyles[i2] = newStyle
      }

      count++
    }

    this.setState({
      sectionStyles,
    })
  }

  detectAndScrollToSection(e) {
    const ev = e.nativeEvent.touches[0];
    const targetY = ev.pageY;
    const { y, width, height, pageX } = this.measure;
    if(!y || targetY < y){
      return;
    }
    let index = Math.floor((targetY - y) / height);
    index = Math.min(index, this.props.sections.length - 1);
    this.highLightSection(index, ev.pageX);
    if (this.lastSelectedIndex !== index && this.props.data[this.props.sections[index]].length) {
      this.lastSelectedIndex = index;
      if (scrollTimeOut) clearTimeout(scrollTimeOut)

      scrollTimeOut = setTimeout(() => {
        this.onSectionSelect(this.props.sections[index], true);
      }, 100);

    }
  }

  fixSectionItemMeasure() {
    const sectionItem = this.refs.sectionItem0;
    if (!sectionItem) {
      return;
    }
    this.measureTimer = setTimeout(() => {
      sectionItem.measure((x, y, width, height, pageX, pageY) => {
        this.measure = {
          y: pageY,
          width,
          height
        };
      })
    }, 0);
  }

  componentWillMount() {
    const baseStyle = StyleSheet.flatten([styles.text, this.props.fontStyle]);
    const sectionBaseStyles = this.props.sections.map((section, index) => baseStyle);
    this.setState({
      sectionItemBaseStyle: baseStyle,
      sectionStyles: sectionBaseStyles,
      sectionBaseStyles,
    });
  }

  componentDidMount() {
    this.fixSectionItemMeasure();
  }

  // fix bug when change data
  componentDidUpdate() {
    this.fixSectionItemMeasure();
  }

  componentWillUnmount() {
    this.measureTimer && clearTimeout(this.measureTimer);
  }

  render() {
    const SectionComponent = this.props.component;
    const sections = this.props.sections.map((section, index) => {
      const title = this.props.getSectionListTitle ?
        this.props.getSectionListTitle(section) :
        section;

        return (
          <View key={index} ref={'sectionItem' + index} pointerEvents="none">
            <SectionItemText style={this.state.sectionStyles[index]}>{title}</SectionItemText>
          </View>
        );
    });

    return (
      <View ref="view" style={[styles.container, this.props.style]}
        onStartShouldSetResponder={returnTrue}
        onMoveShouldSetResponder={returnTrue}
        onResponderGrant={this.detectAndScrollToSection}
        onResponderMove={this.detectAndScrollToSection}
        onResponderRelease={this.resetSection}
      >
        {sections}
      </View>
    );
  }
}

SectionList.propTypes = {

  /**
   * A component to render for each section item
   */
  component: PropTypes.func,

  /**
   * Function to provide a title the section list items.
   */
  getSectionListTitle: PropTypes.func,

  /**
   * Function to be called upon selecting a section list item
   */
  onSectionSelect: PropTypes.func,

  /**
   * The sections to render
   */
  sections: PropTypes.array.isRequired,

  /**
   * A style to apply to the section list container
   */
  style: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
  ]),

  /**
   * Text font size
   */
  fontStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
  ]),
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    alignItems:'flex-end',
    justifyContent:'center',
    right: 5,
    top: 0,
    bottom: 0
  },

  item: {
    padding: 0,
  },

  text: {
    color: '#008fff',
    textAlign: 'center',
    width: 20,
  },

  inactivetext: {
    fontWeight: '700',
    color: '#CCCCCC'
  }
});
