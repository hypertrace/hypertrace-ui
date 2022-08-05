FILENAME="/usr/share/nginx/html/secrets.js"
touch $FILENAME
echo "window.RUDDERSTACK_HT_WRITE_KEY = \"$RUDDERSTACK_HT_WRITE_KEY\";" > $FILENAME
