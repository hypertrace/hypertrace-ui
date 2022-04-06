FILENAME="/usr/share/nginx/html/secrets.js"
touch $FILENAME
if [ -z $ENABLE_ANALYTICS ]
then
   ENABLE_ANALYTICS="false"
fi
echo "window.ENABLE_ANALYTICS = \"$ENABLE_ANALYTICS\";" > $FILENAME
if [ "$ENABLE_ANALYTICS" = "true" ]
then
    echo "window.RUDDERSTACK_HT_WRITE_KEY = \"$RUDDERSTACK_HT_WRITE_KEY\";" >> $FILENAME
    echo "window.RUDDERSTACK_HT_DATAPLANE_URL = \"$RUDDERSTACK_HT_DATAPLANE_URL\";" >> $FILENAME
else 
    echo "Analytics is disabled"
fi