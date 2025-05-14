#!/bin/bash
# Install system dependencies
yum install -y postgresql-libs
# Upgrade pip and install requirements
/usr/bin/pip3 install --upgrade pip
/usr/bin/pip3 install -r /var/app/staging/requirements.txt