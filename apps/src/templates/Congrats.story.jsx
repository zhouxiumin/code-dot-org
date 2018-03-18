import React from 'react';
import Congrats from './Congrats';

export default storybook => {
  return storybook
    .storiesOf('Congrats/FullPage', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Applab, signed out',
        description: `Congrats component if Applab tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="applab"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: 'Applab, student',
        description: `Congrats component if Applab tutorial completed, student`,
        story: () => (
            <Congrats
              completedTutorialType="applab"
              userType="student"
              isEnglish={true}
            />
        )
      },
      {
        name: 'pre-2017 Minecraft, signed out',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="pre2017Minecraft"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: 'pre-2017 Minecraft, student',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="pre2017Minecraft"
              userType="student"
              isEnglish={true}
            />
        )
      },
      {
        name: '2017 Minecraft, signed out',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="2017Minecraft"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: '2017 Minecraft, student',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="2017Minecraft"
              userType="student"
              isEnglish={true}
            />
        )
      },
      {
        name: 'other, signed out',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="other"
              userType="signedOut"
              isEnglish={true}
            />
        )
      },
      {
        name: 'other, student',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="other"
              userType="student"
              isEnglish={true}
            />
        )
      },
      {
        name: 'other, teacher',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
            <Congrats
              completedTutorialType="other"
              userType="teacher"
              isEnglish={true}
            />
        )
      },
    ]);
};
