#!/bin/bash
# Installs the ec2 ami tools and prepares the environment for Instance Store-Backed AMI creation.
# Ref: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-an-ami-instance-store.html#creating-ami-linux-instance
# (Note that the existing ec2-ami-tools Ubuntu package is years out of date.)

# Use ruby2.2 from brightbox PPA for ruby dependency.
sudo apt-add-repository -y ppa:brightbox/ruby-ng
# Make sure we use the latest kernel, etc
sudo apt-get update
sudo apt-get upgrade -y

# Install dependencies:
# - unzip, curl for package download/unpack
# - gdisk, kpartx, grub, ruby[2.2] are ec2-bundle-vol deps)
sudo apt-get install -y unzip curl gdisk kpartx grub ruby2.2

# Download/unzip ec2-ami-tools, then copy files to their default paths (so no environment variable is needed)
TOOLS_VERSION=1.5.7
curl http://s3.amazonaws.com/ec2-downloads/ec2-ami-tools-${TOOLS_VERSION}.zip > /tmp/ec2-ami-tools.zip
pushd /tmp
unzip ec2-ami-tools.zip
AMI_TOOLS=/tmp/ec2-ami-tools-${TOOLS_VERSION}
sudo mkdir -p /usr/etc
sudo cp -a ${AMI_TOOLS}/etc/ec2 /usr/etc/
sudo cp -a ${AMI_TOOLS}/lib/ec2 /usr/lib/
sudo cp -a ${AMI_TOOLS}/bin/* /usr/bin/
popd

# Prepare the fstab and grub-menu entries for Ubuntu 14.04 (steps 4-8 in doc)
sudo sed -e '/\/boot\/efi/ s/^#*/#/' -i /etc/fstab
sudo sed -e "/^kernel/ s#/boot/.*#$(cat /proc/cmdline | cut -c12-)#" -i /boot/grub/menu.lst
