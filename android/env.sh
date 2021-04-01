# Source it (source env.sh; or . ./env.sh) into your shell.

# Example variables I had to use to get Cordova to compile.
export ANDROID_SDK_ROOT=~/Android/Sdk
export PATH=~/android-studio/jre/bin:~/gradle-6.8.3/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:~/cordova/node_modules/.bin/:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools
export JAVA_HOME=/home/bla/android-studio/jre
export ORG_GRADLE_PROJECT_cdvMinSdkVersion=22
