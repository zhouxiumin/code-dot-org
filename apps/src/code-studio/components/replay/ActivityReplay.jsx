//import { Motion, StaggeredMotion, spring } from 'react-motion';
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
        {states.map(state => {
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
        })}
      </div>
    );
  }
});

export default ActivityReplay;
