# Chef

## Basic terminology

## Install

### Ubuntu 14.10

* Install the Chef Development Kit: ([official install instructions](https://docs.chef.io/install_dk.html))
  * Download and install from [downloads.chef.io/chef-dk](http://downloads.chef.io/chef-dk)
  * Verify installation: `chef verify`

* Install local .chef files:
  * Clone `code-dot-org/chef-repo`
  * Download `knife.rb` and add to chef-repo/.chef folder
    * Go to [Management Console](https://manage.chef.io/organizations/code-dot-org), `Administration / organizations / code-dot-org / Actions / Generate Knife Config`.
  * Download `USER.pem` and add to chef-repo/.chef folder
    * Go to [Account Management](https://www.chef.io/account/password), `Password and Key / Reset Your Private Key / Get a New Key`.
  * Pull the SSL certificate down from the Chef server: `knife ssl fetch`
  * Verify install: `knife client list`

* Download the chef repository files to your local workstation:
  * `knife download .`
