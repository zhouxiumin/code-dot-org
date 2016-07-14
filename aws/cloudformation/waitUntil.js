'use strict';

/**
 * @file Long polling using Lambda function and delayed invocations.
 */

const response = require('./cfn-response');
const AWS = require("aws-sdk");

function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function globalError(event, context, err, msg, physicalId) {
  const responseData = {Error: msg};
  let errorMsg = responseData.Error + ": " + JSON.stringify(err);
  console.log(errorMsg);
  response.send(event, context, response.FAILED, responseData, physicalId, errorMsg);
}

function handle(event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));
  console.log(`AWS ${AWS.VERSION}`);

  const props = event.ResourceProperties;
  delete props.ServiceToken;

  const responseData = {};
  let requestType = event.RequestType;
  const stackName = event.StackId.split(':').slice(-1)[0].split('/')[1];
  const resourceId = event.LogicalResourceId;
  let physicalId = event.PhysicalResourceId;
  const newPhysicalId = event.PhysicalResourceId || [stackName, resourceId, randomHex(10)].join('-');

  function error(err, msg) {
    globalError(event, context, err, msg, physicalId);
  }

  function randomHex(len) {
    return require('crypto').randomBytes(len / 2).toString('hex').toUpperCase();
  }

  try {
    for(let x in props) {
      if(x == 'TableMappings' || x == 'ReplicationTaskSettings') { continue; }
      props[x] = parseJson(props[x]);
    }
  } catch (e) {
    error(e);
  }

  const configMap = {
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
  const resourceType = event.ResourceType.split('::').slice(-1)[0];
  const config = configMap[resourceType];

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

  const client = new AWS[configMap.client]();
  console.log(`${configMap.client} v${AWS[configMap.client].prototype.constructor.apiVersions}`);

  let method = '';
  let params = props;
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
