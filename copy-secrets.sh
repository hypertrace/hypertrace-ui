#!/bin/sh
touch secrets.js
if [ -z $ENABLE_ANALYTICS ]
then
   ENABLE_ANALYTICS="false"
fi
echo "window.ENABLE_ANALYTICS = \"$ENABLE_ANALYTICS\";" > secrets.js
if [ "$ENABLE_ANALYTICS" = "true" ]
then
    echo "window.RUDDERSTACK_HT_WRITE_KEY = \"$RUDDERSTACK_HT_WRITE_KEY\";" >> secrets.js
    echo "window.RUDDERSTACK_HT_DATAPLANE_URL = \"$RUDDERSTACK_HT_DATAPLANE_URL\";" >> secrets.js
else 
    echo "Analytics is disabled"
fi