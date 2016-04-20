/**
 * Takes an AWS CloudFormation stack name and instance id and returns the newly-created AMI ID.
 **/
exports.handler = function (event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  var stackName = event.ResourceProperties.StackName;
  var instanceId = event.ResourceProperties.InstanceId;
  var instanceRegion = event.ResourceProperties.Region;

  var responseStatus = "FAILED";
  var responseData = {};

  var AWS = require("aws-sdk");
  var ec2 = new AWS.EC2({region: instanceRegion});

  console.log("REQUEST TYPE:", event.RequestType);
  if (event.RequestType == "Delete") {
    if (stackName && instanceRegion) {
      var params = {
        Filters: [
          {
            Name: 'tag:cloudformation:amimanager:stack-name',
            Values: [ stackName ]
          },
          {
            Name: 'tag:cloudformation:amimanager:stack-id',
            Values: [ event.StackId ]
          },
          {
            Name: 'tag:cloudformation:amimanager:logical-id',
            Values: [ event.LogicalResourceId ]
          }
        ]
      };
      ec2.describeImages(params, function (err, data) {
        if (err) {
          responseData = {Error: "DescribeImages call failed"};
          console.log(responseData.Error + ":\n", err);
          sendResponse(event, context, responseStatus, responseData);
        } else if (data.Images.length === 0) {
          sendResponse(event, context, "SUCCESS", {Info: "Nothing to delete"});
        } else {
          var imageId = data.Images[0].ImageId;
          console.log("DELETING:", data.Images[0]);
          ec2.deregisterImage({ImageId: imageId}, function (err, data) {
            if (err) {
              responseData = {Error: "DeregisterImage call failed"};
              console.log(responseData.Error + ":\n", err);
            } else {
              responseStatus = "SUCCESS";
              responseData.ImageId = imageId;
            }
            sendResponse(event, context, "SUCCESS");
          });
        }
      });
    } else {
      responseData = {Error: "StackName or InstanceRegion not specified"};
      console.log(responseData.Error);
      sendResponse(event, context, responseStatus, responseData);
    }
    return;
  }

  if (stackName && instanceId && instanceRegion) {
    ec2.createImage(
      {
        InstanceId: instanceId,
        Name: stackName + '-' + instanceId,
        NoReboot: true
      }, function (err, data) {
        if (err) {
          responseData = {Error: "CreateImage call failed"};
          console.log(responseData.Error + ":\n", err);
          sendResponse(event, context, responseStatus, responseData);
        } else {
          var imageId = data.ImageId;
          console.log('SUCCESS: ', "ImageId - " + imageId);

          var params = {
            Resources: [imageId],
            Tags: [
              {
                Key: 'cloudformation:amimanager:stack-name',
                Value: stackName
              },
              {
                Key: 'cloudformation:amimanager:stack-id',
                Value: event.StackId
              },
              {
                Key: 'cloudformation:amimanager:logical-id',
                Value: event.LogicalResourceId
              }
            ]
          };
          ec2.createTags(params, function (err, data) {
            if (err) {
              responseData = {Error: "Create tags call failed"};
              console.log(responseData.Error + ":\n", err);
            } else {
              responseStatus = "SUCCESS";
              responseData.ImageId = imageId;
            }
            sendResponse(event, context, responseStatus, responseData);
          });
        }
      }
    );
  } else {
    responseData = {Error: "StackName, InstanceId or InstanceRegion not specified"};
    console.log(responseData.Error);
    sendResponse(event, context, responseStatus, responseData);
  }
};
