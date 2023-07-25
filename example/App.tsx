import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  NativeEventEmitter
} from 'react-native';

import RTNNotificationApi from 'notificationapi-react-native-sdk/js'
import { Events } from 'notificationapi-react-native-sdk/js/NotificationApiEvents'

function App(): JSX.Element {
  useEffect(() => {
    RTNNotificationApi?.configure('clientId', 'userId', undefined)

    RTNNotificationApi?.requestNotificationPermission()

    const eventEmitter = new NativeEventEmitter(undefined)
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
