import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherHomepage from '@cdo/apps/templates/teacherHomepage/TeacherHomepage';

$(document).ready(showTeacherHomepage);

function showTeacherHomepage() {
  const coursesData = document.querySelector('script[data-courses]');
  const configCourses = JSON.parse(coursesData.dataset.courses);

  const sectionsData = document.querySelector('script[data-sections]');
  const configSections = JSON.parse(sectionsData.dataset.sections);

  const announcementsData = document.querySelector('script[data-announcements]');
  console.log(announcementsData);
  const configAnnouncements = JSON.parse(announcementsData.dataset.announcements);

  ReactDOM.render (
    <TeacherHomepage
      announcements={configAnnouncements}
      courses={configCourses}
      sections={configSections}
    />,
  document.getElementById('teacher-homepage-container')
  );
}
