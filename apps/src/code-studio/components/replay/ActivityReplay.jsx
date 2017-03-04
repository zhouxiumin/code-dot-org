import React from 'react';

const ActivityReplay = React.createClass({
  propTypes: {
    nextAttempts: React.PropTypes.object,
  },

  getInitialState() {
    return {current: 0};
  },

  reset() {
    this.navigate(0);
  },

  navigate(k) {
    this.setState({current: k});
  },

  render() {
    const histogram = this.props.nextAttempts[this.state.current];
    return (
      <div>
        <p>Current: {this.state.current}</p>
        <p onClick={this.reset}>Reset</p>
        <p>Most common next attempt:</p>
        {histogram ?
          Object.keys(histogram).sort((a, b) => histogram[b] - histogram[a]).map(k =>
            <div onClick={this.navigate.bind(this, k)}>
              <a href={`/c/${k}/edit`} style={{width: 120, float: 'left', clear: 'left'}}>{k}</a>
              <div style={{width: histogram[k], height: 20, float: 'left', background: '#def'}}></div>
              <div style={{float: 'left'}}>{histogram[k]}</div>
            </div>
          ) :
          <p>No results</p>
        }
      </div>
    );
  },
});

/*
import { Motion, StaggeredMotion, spring } from 'react-motion';
import React from 'react';

const states = [-4, 1, 2, 3, 17, 20, 22, 31, 100].map((state, index) => ({
  value: state,
  top: ((index * 17) % 29) * 15,
  left: Math.log(Math.abs(state)) * 200,
}));

const styles = {
  container: {
    position: 'relative',
  },
  state: {
    position: 'absolute',
    padding: '5px 20px',
    borderRadius: 20,
    background: '#333',
    color: '#fff',
  },
};

const ActivityReplay = React.createClass({
  propTypes: {
    steps: React.PropTypes.array,
  },

  render() {
    return (
      <div style={styles.container}>
        <StaggeredMotion
          defaultStyles={Array(this.props.steps.length).fill({ progress: 0 })}
          styles={prevInterpolatedStyles => prevInterpolatedStyles.map((prev, i) => {
            const config = {stiffness: 30, damping: 25};
            return i === 0 ?
              {progress: spring(1, config)} :
              {progress: spring(prevInterpolatedStyles[i - 1].progress >= 1 ? 1 : 0, config)};
          })}
        >
          {interpolatingValues => {
            const interpolatingStyles = interpolatingValues.map(v => ({
              width: v.progress * 100,
              height: v.progress * 200,
            }));
            console.log(interpolatingStyles[0]);
            return <div style={{background: '#0f0', height: interpolatingStyles[0].height, width: interpolatingStyles[3].width}}>Test</div>
            /*return states.map(state => {
              return (
                <div
                  style={{
                    top: state.top,
                    left: state.left,
                    ...styles.state
                  }}
                  key={state.value}
                >
                  {state.value}
                </div>
              );
            });/////
          }}
        </StaggeredMotion>
      </div>
    );
  }
});

*/

export default ActivityReplay;
