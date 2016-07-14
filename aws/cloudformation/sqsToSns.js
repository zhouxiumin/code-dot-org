'use strict';

/**
 * @file AWS Lambda function that forwards all messages in an SQS queue to a specified SNS topic or Lambda function.
 */
const AWS = require("aws-sdk");
const async = require('async');

exports.handler = function (event, context) {
  const sqs = new AWS.SQS();
  const sns = new AWS.SNS();
  const lambda = new AWS.Lambda();

  sqs.getQueueUrl({QueueName: 'SqsToSnsQueue'}, function(err, data) {
    if (err) console.log('SQS get queue url failed: ' + err.message);
    if (data && data.QueueUrl) {
      poll(queueUrl);
    }
  });

  function poll(queueUrl) {
    const receiveParams = {
      QueueUrl: queueUrl,
      MessageAttributeNames: 'All',
      MaxNumberOfMessages: 10
    };
    sqs.receiveMessage(receiveParams, function(err, response) {
      if (err) {
        console.log('SQS receive message failed: ' + err.message);
      }

      if (response && response.Messages && response.Messages.length > 0) {
        async.each(response.Messages, processMessage, function () {
          // poll again once all of the messages have been processed.
          poll(queueUrl);
        });
      }
    });
  }

  function handleMessage (message, done) {
    if (message.MessageAttributes && message.MessageAttributes.snsTopic) {
      let snsTopic = message.MessageAttributes.snsTopic.StringValue;
      sns.publish({
        Message: message.Message,
        MessageAttributes: message.MessageAttributes
      }, function(err, data) {
        if (err) {
          console.log('SNS publish failed: ' + err.message);
        }
        done();
      });
    } else if (message.MessageAttributes && message.MessageAttributes.lambdaFunction) {
      let lambdaFunction = message.MessageAttributes.lambdaFunction.StringValue;
      lambda.invoke({
        FunctionName: lambdaFunction,
        InvocationType: 'Event',
        Payload: message.Message
      }, function(err, data) {
        if (err) {
          console.log('Lambda invoke failed: ' + err.message);
        }
        done();
      });
    }
  }

  function processMessage(message, cb) {
    async.series([
      function (done) { handleMessage(message, done); },
      function (done) { deleteMessage(message, done); }
    ], function (err) {
      if (err) {
        console.log('SQS process message failed: ' + err.message);
      }
      cb();
    });
  }

  function deleteMessage(message, cb) {
    let deleteParams = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.ReceiptHandle
    };

    sqs.deleteMessage(deleteParams, function (err) {
      if (err) return cb('SQS delete message failed: ' + err.message);
      cb();
    });
  }
};
