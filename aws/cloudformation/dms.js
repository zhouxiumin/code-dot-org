'use strict';

/**
 * @file AWS Lambda Custom Resource for CRUD operations on DMS resources.
 * @see {@link http://docs.aws.amazon.com/dms/latest/APIReference|DMS API Reference}
 * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DMS.html|DMS JavaScript SDK Reference}
 */

// This module is automatically provided to ZipFile-based Lambda functions.
// Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
var response = require('./cfn-response');
var crypto = require('crypto');
var AWS = require("aws-sdk");

function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function globalError(event, context, err, msg, physicalId) {
  var responseData = {Error: msg};
  let errorMsg = responseData.Error + ": " + JSON.stringify(err);
  console.log(errorMsg);
  response.send(event, context, response.FAILED, responseData, physicalId, errorMsg);
}

function handle(event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));
  console.log(`AWS ${AWS.VERSION}`);

  var props = event.ResourceProperties;
  delete props.ServiceToken;

  var responseData = {};
  var requestType = event.RequestType;
  var stackName = event.StackId.split(':').slice(-1)[0].split('/')[1];
  var resourceId = event.LogicalResourceId;
  var physicalId = event.PhysicalResourceId;
  var newPhysicalId = event.PhysicalResourceId || [stackName, resourceId, randomHex(10)].join('-');

  function error(err, msg) {
    globalError(event, context, err, msg, physicalId);
  }

  function randomHex(len) {
    return require('crypto').randomBytes(len / 2).toString('hex').toUpperCase();
  }

  try {
    for(var x in props) {
      if(x == 'TableMappings' || x == 'ReplicationTaskSettings') { continue; }
      props[x] = parseJson(props[x]);
    }
  } catch (e) {
    error(e);
  }

  var configMap = {
    client: 'DMS',
    ReplicationInstance: {
      suffix: 'ReplicationInstance',
      createId: 'ReplicationInstanceIdentifier',
      id: 'ReplicationInstanceArn'
    },
    Endpoint: {
      suffix: 'Endpoint',
      createId: 'EndpointIdentifier',
      id: 'EndpointArn'
    },
    ReplicationTask: {
      suffix: 'ReplicationTask',
      createId: 'ReplicationTaskIdentifier',
      id: 'ReplicationTaskArn'
    },
    ReplicationSubnetGroup: {
      suffix: 'ReplicationSubnetGroup',
      id: 'ReplicationSubnetGroupIdentifier'
    }
  };
  var resourceType = event.ResourceType.split('::').slice(-1)[0];
  var config = configMap[resourceType];

  if (!config) {
    error(null, `${resourceType} is not a valid resource type`);
  }

  // Valid RequestTypes: "Create", "Delete", "Update".
  // Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes.html
  console.log("REQUEST TYPE:", event.RequestType);
  if (requestType == "Update") {
    // Immutable update: create a new instance with new physicalId.
    requestType = "Create";
  }

  var client = new AWS[configMap.client]();
  console.log(`${configMap.client} v${AWS[configMap.client].prototype.constructor.apiVersions}`);

  var method = '';
  var params = props;
  if (requestType == "Create") {
    params[config.createId || config.id] = newPhysicalId;
    method = 'create' + config.suffix;
    client[method](params, function(err, data) {
      if (err) {
        error(err, 'error in ' + method);
      } else {
        physicalId = data[config.suffix][config.id];
        response.send(event, context, response.SUCCESS, responseData, physicalId, '');
      }
    });
  } else if (requestType == "Delete") {
    params = {};
    params[config.id] = physicalId;
    method = "delete" + config.suffix;
    client[method](params, function(err, data) {
      if (err) {
        console.log("Error in " + method + ":", err);
      }
      // Always return success on delete, so stack doesn't get stuck.
      response.send(event, context, response.SUCCESS, responseData, physicalId, '');
    });
  } else {
    error(null, "Invalid RequestType: " + requestType);
  }
}

// Wrap handler in try/catch to send failure response in case of any global exception.
exports.handler = function (event, context) {
  try {
    handle(event, context);
  } catch (e) {
    globalError(event, context, e, '');
  }
};
