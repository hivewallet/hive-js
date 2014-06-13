/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var argscheck = require('cordova/argscheck'),
utils = require('cordova/utils'),
exec = require('cordova/exec');

var TestFlight = function() {
    this.serviceName = "TestFlightSDK";
};

/*
 Add custom environment information
 If you want to track a user name from your application you can add it here

 @param successCallback function
 @param failureCallback function
 @param key string
 @param information string
 */
TestFlight.prototype.addCustomEnvironmentInformation = function(successCallback, failureCallback, key, information) {
    exec(successCallback, failureCallback, this.serviceName, "addCustomEnvironmentInformation", 
                  [ key, information]);
};

/*
 Starts a TestFlight session

 @param successCallback function
 @param failureCallback function
 @param appToken string
 */
TestFlight.prototype.takeOff = function(successCallback, failureCallback, appToken) {
    if (!appToken) {
        var errorString = "Invalid App Token: null";

        if (failureCallback) {
            failureCallback(errorString);
        } else {
            console.error(errorString);
        }
    } else {
        exec(successCallback, failureCallback, this.serviceName, "takeOff", [ appToken ]);
    }
};

/*
 Sets custom options

 @param successCallback function
 @param failureCallback function
 @param options object i.e { reinstallCrashHandlers : true }
 */
TestFlight.prototype.setOptions = function(successCallback, failureCallback, options) {
    if (!(null !== options && 'object' == typeof(options))) {
        options = {};
    }
    exec(successCallback, failureCallback, this.serviceName, "setOptions", [ options ]);
};

/*
 Track when a user has passed a checkpoint after the flight has taken off. Eg. passed level 1, posted high score

 @param successCallback function
 @param failureCallback function
 @param checkpointName string
 */
TestFlight.prototype.passCheckpoint = function(successCallback, failureCallback, checkpointName) {
    exec(successCallback, failureCallback, this.serviceName, "passCheckpoint", [ checkpointName ]);
};

/*
 Remote logging (synchronous)

 @param successCallback function
 @param failureCallback function
 @param message string
 */
TestFlight.prototype.remoteLog = function(successCallback, failureCallback, message) {
    exec(successCallback, failureCallback, this.serviceName, "remoteLog", [ message ]);
};

/*
 Remote logging (async) - note that you may lose logs during a crash if you use this.

 @param successCallback function
 @param failureCallback function
 @param message string
 */
TestFlight.prototype.remoteLogAsync = function(successCallback, failureCallback, message) {
    exec(successCallback, failureCallback, this.serviceName, "remoteLogAsync", [ message ]);
};
           

/*
  Submits custom feedback to the site. Sends the data in feedback to the site. 
  This is to be used as the method to submit feedback from custom feedback forms.
 
  @param feedback Your users feedback, method does nothing if feedback is nil
*/
TestFlight.prototype.submitFeedback = function(successCallback, failureCallback, feedback) {
    exec(successCallback, failureCallback, this.serviceName, "submitFeedback", [ feedback ]);
};

/*
 Sets your own Device Identifier.

 If you do not provide the identifier you will still see all session data, with
 checkpoints and logs, but the data will be anonymized.
 
  @param deviceIdentifer The current devices device identifier
*/
TestFlight.prototype.setDeviceIdentifier = function(successCallback, failureCallback, deviceIdentifier) {
    console.warn('setDeviceIdentifier() is deprecated');
    setTimeout(successCallback, 0);
};

/*
 Sets the device identifier as the identifierForVendor.

 @param successCallback function
 @param failureCallback function
*/
TestFlight.prototype.setDeviceIdentifierUUID = function(successCallback, failureCallback) {
    console.warn('setDeviceIdentifierUUID() is deprecated');
    setTimeout(successCallback, 0);
};

/*
 Manually start a session.

 @param successCallback function
 @param failureCallback function
 */
TestFlight.prototype.manuallyStartSession = function(successCallback, failureCallback) {
    exec(successCallback, failureCallback, this.serviceName, "manuallyStartSession", [ ]);
};

/*
 Manually end a session.

 @param successCallback function
 @param failureCallback function
 */
TestFlight.prototype.manuallyEndSession = function(successCallback, failureCallback) {
    exec(successCallback, failureCallback, this.serviceName, "manuallyEndSession", [ ]);
};


module.exports = TestFlight;
