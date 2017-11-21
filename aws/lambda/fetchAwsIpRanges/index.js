const Github = require('github'),
  request = require('request'),
  async = require('async');

const IP_RANGES_URL = 'https://ip-ranges.amazonaws.com/ip-ranges.json';

/**
 * Lambda function that fetches and processes updated Amazon IP-ranges,
 * and creates a new GitHub PR with updated content.
 */
exports.handler = function (event, context, callback) {
  let newBranch,
    commitMessage,
    baseCommit,
    newCommit,
    newCommitSha,
    content,
    pullRequest;

  const user = 'deploy-code-org',
    reviewer = 'wjordan',
    owner = 'code-dot-org',
    repository = 'code-dot-org',
    baseBranch = 'staging',
    path = 'lib/cdo/trusted_proxies.json',
    github = new Github(),
    gh = github.gitdata,
    pr = github.pullRequests;

  github.authenticate({
    type: "basic",
    username: user,
    password: process.env.GITHUB_TOKEN
  });

  let repo = obj => Object.assign({owner: owner, repo: repository}, obj);
  let go = (cb, f) => ((err, data) => {
    if (err) {
      cb(err);
    } else {
      if (f) {f(data);}
      cb(null);
    }
  });

  async.waterfall([
    cb => async.parallel([
      cb2 => request(IP_RANGES_URL, (error, response, body) => {
        if (error) { return cb2(error); }
        const info = JSON.parse(body);
        const output = {
          comment: `Generated from ${IP_RANGES_URL}`,
          syncToken: info.syncToken,
          createDate: info.createDate,
          ranges: info.prefixes
            .filter((range) => range.service === 'CLOUDFRONT')
            .map((range) => range.ip_prefix)
        };
        newBranch = `AwsIpRanges-${output.syncToken}`;
        commitMessage = `AwsIpRanges: sync to ${output.syncToken}`;
        content = JSON.stringify(output, null, 2);
        cb2(null);
      }),

      cb2 => gh.getReference(
        repo({ref: `heads/${baseBranch}`}),
        go(cb2, data => baseCommit = data.data.object.sha)
      )
    ], _ => cb()),

    cb => gh.createTree(
      repo({
        tree: [{
          path: path,
          mode: '100644',
          type: 'blob',
          content: content
        }],
        base_tree: baseCommit
      }),
      go(cb, data => newCommit = data.data.sha)
    ),

    cb => gh.createCommit(
      repo({
        message: commitMessage,
        tree: newCommit,
        parents: [baseCommit]
      }),
      go(cb, data => newCommitSha = data.data.sha)
    ),

    cb => gh.createReference(
      repo({
        ref: `heads/${newBranch}`,
        sha: newCommitSha
      }),
      go(cb)
    ),

    cb => pr.create(
      repo({
        title: commitMessage,
        head: newBranch,
        base: baseBranch,
      }),
      go(cb, data => pullRequest = data.data.id)
    ),

    cb => pr.createReviewRequest(
      repo({
        number: pullRequest,
        reviewers: [reviewer]
      }),
      go(cb)
    )
  ], callback);
};
