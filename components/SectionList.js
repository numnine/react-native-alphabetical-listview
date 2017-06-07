'use strict';

import React, {
  Component,
  PropTypes,
} from 'react';
import ReactNative, {
  StyleSheet,
  View,
  Text,
  NativeModules,
} from 'react-native';
import SectionItemText from './SectionItemText'

const { UIManager } = NativeModules;

const noop = () => {};
const returnTrue = () => true;

export default class SectionList extends Component {

  constructor(props, context) {
    super(props, context);

    this.onSectionSelect = this.onSectionSelect.bind(this);
    this.resetSection = this.resetSection.bind(this);
    this.detectAndScrollToSection = this.detectAndScrollToSection.bind(this);
    this.lastSelectedIndex = null;

    this.state = {
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

  highLightSection(index) {
    const sectionStyles = this.state.sectionBaseStyles.slice();
    const toBeUpdatedMatrix = [-3, -2, -1, 0, 1, 2, 3].reduce((properIdxs, offIdx) => {
      const properIdx = index + offIdx;
      if (properIdx >= 0) {
        let ratio = 2.4
        let fontRatio = 1.8
        switch (Math.abs(offIdx)) {
          case 3:
            ratio = 1.2;
            fontRatio = 1.2;
            break;
          case 2:
            ratio = 1.6;
            fontRatio = 1.4;
            break;
          case 1:
            ratio = 2;
            fontRatio = 1.6;
            break;
          default:
            ratio = 2.4;
            fontRatio = 1.8;
        }
        properIdxs.push({
          offIdx,
          index: properIdx,
          ratio,
          fontRatio,
        })
      }
      return properIdxs;
    }, [])

    toBeUpdatedMatrix.forEach((e) => {
      sectionStyles[e.index] = {
        fontSize: 11 * e.fontRatio,
        lineHeight: 20,
        width: 40 * e.ratio,
        textAlign: 'left',
      };

      if (e.offIdx === 0) {
        sectionStyles[e.index] = Object.assign(sectionStyles[e.index], {
          fontWeight: 'bold',
        })
      }
    });

    this.setState({
      sectionStyles,
    })
  }

  detectAndScrollToSection(e) {
    const ev = e.nativeEvent.touches[0];
    //var rect = {width:1, height:1, x: ev.locationX, y: ev.locationY};
    //var rect = [ev.locationX, ev.locationY];

    //UIManager.measureViewsInRect(rect, e.target, noop, (frames) => {
    //  if (frames.length) {
    //    var index = frames[0].index;
    //    if (this.lastSelectedIndex !== index) {
    //      this.lastSelectedIndex = index;
    //      this.onSectionSelect(this.props.sections[index], true);
    //    }
    //  }
    //});
    //UIManager.findSubviewIn(e.target, rect, viewTag => {
      //this.onSectionSelect(view, true);
    //})
    const targetY = ev.pageY;
    const { y, width, height } = this.measure;
    if(!y || targetY < y){
      return;
    }
    let index = Math.floor((targetY - y) / height);
    index = Math.min(index, this.props.sections.length - 1);
    this.highLightSection(index);
    if (this.lastSelectedIndex !== index && this.props.data[this.props.sections[index]].length) {
      this.lastSelectedIndex = index;
      this.onSectionSelect(this.props.sections[index], true);
    }
  }

  fixSectionItemMeasure() {
    const sectionItem = this.refs.sectionItem0;
    if (!sectionItem) {
      return;
    }
    this.measureTimer = setTimeout(() => {
      sectionItem.measure((x, y, width, height, pageX, pageY) => {
        //console.log([x, y, width, height, pageX, pageY]);
        this.measure = {
          y: pageY,
          width,
          height
        };
      })
    }, 0);
  }

  componentWillMount() {
    const sectionBaseStyles = this.props.sections.map((section, index) => ({
      fontSize: 11,
    }));
    this.setState({
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

      const textStyle = this.props.data[section].length ?
        styles.text :
        styles.inactivetext;

      const flattenStyle = StyleSheet.flatten([textStyle, this.state.sectionStyles[index]]);

      const child = SectionComponent ?
        <SectionComponent
          sectionId={section}
          title={title}
        /> :
        <View
          style={styles.item}>
          <SectionItemText style={flattenStyle}>{title}</SectionItemText>
        </View>;

      //if(index){
        return (
          <View key={index} ref={'sectionItem' + index} pointerEvents="none">
            {child}
          </View>
        );
      //}
      //else{
      //  return (
      //    <View key={index} ref={'sectionItem' + index} pointerEvents="none"
      //          onLayout={e => {console.log(e.nativeEvent.layout)}}>
      //      {child}
      //    </View>
      //  );
      //
      //}
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
    fontFamily: 'NotoSansCJKjp-Regular',
    color: '#84bb32',
    textAlign: 'center',
    width: 20,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 'normal',
  },

  inactivetext: {
    fontWeight: '700',
    color: '#CCCCCC'
  }
});
