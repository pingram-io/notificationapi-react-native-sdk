/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  NativeEventEmitter,
  NativeModules
} from 'react-native';

import RTNNotificationApi from 'notificationapi-react-native-sdk/js/NativeNotificationApi'
import { Events } from 'notificationapi-react-native-sdk/js/NotificationApiEvents'

function App(): JSX.Element {
  useEffect(() => {
    RTNNotificationApi?.configure('clientId', 'userId')

    console.log(JSON.stringify(NativeModules))

    const eventEmitter = new NativeEventEmitter(NativeModules.RTNNotificationApi)
    let listener = eventEmitter.addListener(Events.NOTIFICATION_PERMISSIONS_REQUESTED, event => {
      console.log(event)
    })

    return () => {
      listener.remove()
    }
  }, [])

  return (
    <SafeAreaView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic">
        <View>
          <Text>Configured!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
