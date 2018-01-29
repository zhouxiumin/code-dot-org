/* global dashboard */

import $ from 'jquery';

/**
 * Dynamic generation and event bindings for project admin section of the admin box
 */
export default () => {
  if ($('.project_admin').length) {
    if (dashboard.project.isProjectLevel()) {
      if (dashboard.project.isFrozen()) {
        $('.project_admin').html($('<span>&#x2744; Frozen! To use as an example, copy this id: <input type="text" disabled value="' +
          dashboard.project.getCurrentId() +
          '"/></span>'));
      } else {
        $('.project_admin').html($('<button id="freeze" class="btn btn-default btn-sm">Freeze for use as an exemplar &#x2744;</button>'));
        $('#freeze').click(function () {
          dashboard.project.freeze(function () {
            window.location.reload();
          });
        });
      }
    }
  }

  if ($('#feature_project').length && dashboard.project.isProjectLevel()) {
    var deleteUrl = `/featured_projects/${dashboard.project.getCurrentId()}`;
    $('#unfeature_project').click(function () {
      // When the unfeature button is clicked:
      // find the FeaturedProject that matches this project
      // update unfeatured_at to the current date
      // update is_featured to false
      $.ajax({
        url: deleteUrl,
        type:'DELETE',
        dataType:'json',
        success:function (data){
          $('#unfeature_project').hide();
          $('#feature_project').show();
        },
        error:function (data){
          alert("Shucks. Something went wrong - this project is still featured.");
        }
      });
    });

    $('#feature_project').click(function () {
      // When the feature button is clicked:
      // check if there is a FeaturedProject that matches this project
        // if there is a Featured Project:
          // update is_featured to true
          // update featured_at to current date
          // update who featured
        // if there is NOT a Featured Project:
          // make a new Featured Project
          // is_featured is true
          // featured_at is current time
          // who featured is the current user
      $.ajax({
        url:'/featured_projects',
        type:'POST',
        dataType:'json',
        data: {
          featured_project: {
            project_id: dashboard.project.getCurrentId(),
          }
        },
        success:function (data){
          $('#unfeature_project').show();
          $('#feature_project').hide();
        },
        error:function (data){
          alert("Shucks. Something went wrong - this project wasn't featured.");
        }
      });
    });
  }

  if ($('.admin-abuse').length && dashboard.project.isProjectLevel()) {
    var abuseScore = dashboard.project.getAbuseScore();
    if (abuseScore) {
      $('.admin-abuse').show();
      $('.admin-abuse-score').text(abuseScore);
      $('.admin-abuse-reset').click(function () {
        dashboard.project.adminResetAbuseScore();
      });
    } else {
      $('.admin-report-abuse').show();
    }
  }
};
