#!/bin/bash

### start of getting version
VERSION="$(jq -r '.version' ./package.json)"
if [ "$VERSION" == "0.0.0" ]
then
  VERSION="dev"
else
  VERSION="v$VERSION"
fi
echo "version : $VERSION"
### end of getting version
ARCHIVE_NAME="appbee-server-$VERSION.zip"
echo ARCHIVE_NAME

mkdir output
git archive -v -o output/$ARCHIVE_NAME --format=zip HEAD

curl -F file=@output/$ARCHIVE_NAME \
    -F channels="#dev" \
    -F initial_comment="$1 브랜치에서 $VERSION 버전 아카이브 배달왔어요!" \
    -F token=$SLACK_BOT_TOKEN \
    https://slack.com/api/files.upload