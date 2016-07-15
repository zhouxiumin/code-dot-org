'use strict';

/**
 * @file AWS Lambda Custom Resource for CRUD operations on DMS resources.
 * @see {@link http://docs.aws.amazon.com/dms/latest/APIReference|DMS API Reference}
 * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DMS.html|DMS JavaScript SDK Reference}
 */

const response = require('./cfn-response');
const crypto = require('crypto');
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

  function success() {
    response.send(event, context, response.SUCCESS, responseData, physicalId, '');
  }

  function randomHex(len) {
    return require('crypto').randomBytes(len / 2).toString('hex').toUpperCase();
  }

  try {
    for(let x in props) {
      // Specific properties require a JSON string instead of a parsed JSON object.
      if(x == 'TableMappings' || x == 'ReplicationTaskSettings') { continue; }
      props[x] = parseJson(props[x]);
    }
  } catch (e) {
    error(e);
    return;
  }

  const configMap = {
    client: 'DMS',
    ReplicationInstance: {
      suffix: 'ReplicationInstance',
      createId: 'ReplicationInstanceIdentifier',
      id: 'ReplicationInstanceArn',
      waiter: 'replicationInstanceAvailable',
      deleteWaiter: 'replicationInstanceDeleted',
      waiterFilter: 'replication-instance-arn'
    },
    Endpoint: {
      suffix: 'Endpoint',
      createId: 'EndpointIdentifier',
      id: 'EndpointArn',
      waiter: 'endpointActive',
      deleteWaiter: 'endpointDeleted',
      waiterFilter: 'endpoint-arn'
    },
    ReplicationTask: {
      suffix: 'ReplicationTask',
      createId: 'ReplicationTaskIdentifier',
      id: 'ReplicationTaskArn',
      waiter: 'replicationTaskReady',
      deleteWaiter: 'replicationTaskDeleted',
      waiterFilter: 'replication-task-arn'
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
    return;
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
  if (event.waiting) {
    wait();
  } else if (requestType == "Create") {
    params[config.createId || config.id] = newPhysicalId;
    method = 'create' + config.suffix;
    client[method](params, function(err, data) {
      if (err) {
        error(err, 'error in ' + method);
      } else {
        physicalId = event.PhysicalResourceId = data[config.suffix][config.id];
        if (config.waiter) {
          wait();
        } else {
          success();
        }
      }
    });
  } else if (requestType == "Delete") {
    params = {};
    params[config.id] = physicalId;
    method = "delete" + config.suffix;
    client[method](params, function(err, data) {
      if (err) {
        if (err.code == "ResourceNotFoundFault") {
          success();
        } else if (err.code == "InvalidParameterValueException") {
          console.log(`error in ${method}: ${err.message}`);
          success();
        } else {
          error(err, 'error in ' + method);
        }
      } else if (config.deleteWaiter) {
        wait();
      } else {
        success();
      }
    });
  } else {
    error(null, "Invalid RequestType: " + requestType);
  }

  // Execute a waiter and recurse if it doesn't complete before the timeout.
  function wait() {
  try {
    let state = requestType == "Create" ? config.waiter : config.deleteWaiter;
    event.waiting = true;
    params = {
      Filters: [{
          Name: config.waiterFilter,
          Values: [physicalId]
      }]
    };
    client.waitFor(state, params, (err, data) => {
      if (err) { error(err, 'error in ' + method);}
      else success();
    });
    setTimeout(() => {
     console.log("Timeout reached, re-executing function");
     let lambda = new AWS.Lambda();
      lambda.invoke({
        FunctionName: context.invokedFunctionArn,
        InvocationType: 'Event',
        Payload: JSON.stringify(event)
      }, (err, data) => {
        if (err) { error(err, 'error in lambda recurse'); }
        else context.done();
      });
    }, context.getRemainingTimeInMillis() - 1000);
    } catch (e) {
      globalError(event, context, e, '');
    }
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
